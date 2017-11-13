var fs = require("fs");
// var csv = require("fast-csv"); //json parsor
var ODatabase = require('orientjs').ODatabase;
var request = require('request');
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

// db.open();
//
// endImport();

// ------- Do the DB stuff -------

var orientHost = "localhost";
var orientPort = 2424;
var orientUser = "admin";
var orientPassword = "admin";
var orientDbName = "autobot";

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
  db.insert().into(className).set({
    color: data.color,
    category: data.category,
    type: data.type
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

// ------- Read Json File -------
console.log("\n *START* \n");
var content = fs.readFileSync("/Users/paulhwang/dev/study/orientdb/color.json");
var jsonContent = JSON.parse(content);
insertElement(jsonContent);

// for(var exKey in exjson) {
//     console.log("key:"+exKey+", value:"+exjson[exKey]);
//     insertElement(exjson[exKey]);
// }

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
// db.open().then(function() {
//   stream.pipe(csvStream)
// })
