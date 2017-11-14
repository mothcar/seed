var fs = require("fs");
var csv = require("fast-csv");
var ODatabase = require('orientjs').ODatabase;

// ------- check CLI input -------
if(process.argv.length < 4){
	console.log("Please use the following syntax");
	console.log("");
	console.log("node csvimport.js <className> <csvFilePath> [<OrientDbURL> <OrientDbPort> <OrientDbName> <OrientDbUser> <OrientDbPassword>]");
	console.log("");
	console.log("Defaults:");
	console.log("OrientDbURL = localhost //the server URL");
	console.log("OrientDbPort = 2424 //the http port");
	console.log("OrientDbName = geo //the db name");
	console.log("OrientDbUser = admin ");
	console.log("OrientDbPassword = admin");
	console.log("");
	return;
}

var className = process.argv[2]
var inputFile = process.argv[3]

// ------- Configure the CSV importer -------
console.log("Importing file "+inputFile+" into class "+className);
var stream = fs.createReadStream(inputFile);
var csvStream = csv
.parse({headers: true})
.on("data", function(data){
	insertElement(data);
}).on("end", function(data){
	endImport();
});

// ------- Do the DB stuff -------

var orientHost = "localhost";
var orientPort = 2424;
var orientUser = "admin";
var orientPassword = "admin";
var orientDbName = "o2";

if(process.argv.length >= 8){
	orientHost = process.argv[4]
	orientPort = parseInt(process.argv[5])
	orientDbName = process.argv[6]
	orientUser = process.argv[7]
	orientPassword = process.argv[8]
}

console.log("connecting to OrientDB:")
console.log(""+orientHost+":"+orientPort+"/"+orientDbName);

var db = new ODatabase({
	host:     orientHost,
	port:     orientPort,
	username: orientUser,
	password: orientPassword,
	name:     orientDbName
});

var i = 0;
var queue = 0;
var finished = false;

var insertElement = function(data){
	queue++;

	// console.log("aaaaa : ", {floor:data['desc.floor'], metaDesc:data['desc.metaDesc'], metaPhoto:data['desc.metaPhoto'], metaTitle:data['desc.metaTitle']})
	// console.log('data :', data);
	// [data['desc.floor']

	db.insert().into(className).set({
		_id: data._id,
		action: data.action,
		actions: data.actions,
		address: data.address,
		adminArea: data.adminArea,
		countryCode: data.countryCode,
		countryName: data.countryName,
		desc: data.desc,
		email: data.email,
		featureName: data.featureName,
		followers: data.followers,
		gcmTokens: data.gcmTokens,
		keywords: data.keywords,
		latitude: data.latitude,
		level: data.level,
		locality: data.locality,
		longitude: data.longitude,
		name: data.name,
		owner: data.owner,
		parent: data.parent,
		password: data.password,
		phone: data.phone,
		photos: data.photos,
		point: data.point,
		read: data.read,
		roles: data.roles,
		subLinks: data.subLinks,
		thoroughfare: data.thoroughfare,
		type: data.type,
	})
	.one().then(function(){
		i++;
		queue--;
		checkFinished();
	}).catch(function(error){
		queue--;
		checkFinished();
		console.log(error)
	});
}

var endImport = function(){
	finished = true;
	checkFinished();
}

var checkFinished = function(){
	if(finished && queue===0){
		db.close();
		console.log("Done!\n"+i+" records imported");
	}
}

// ------- Start the actual import procedure -------
db.open().then(function() {
	stream.pipe(csvStream)
})
