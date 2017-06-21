const express = require('express')
const app = express();
var fs = require('fs');
var mongo = require('mongodb');
var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({ extended: false });

var MongoClient = require('mongodb').MongoClient
    , mydb = require('assert');


var url = 'mongodb://localhost:27017/mydb';
// Use connect method to connect to the Server
var database;


MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    database = db;

    var collection = db.collection('hospitalList');
    collection.insertMany([{"Name":"Swedish-Branch1", "Floor": "3rd", "Phone": "678-989-1200"},
        {"Name":"Swedish-Branch2", "Floor": "5th", "Phone": "678-789-1300"},
        {"Name":"ViginiaMason-Branch1", "Floor": "3rd", "Phone": "425-979-1200"},
        {"Name":"ViginiaMason-Branch12", "Floor": "1st", "Phone": "425-989-1200"}], function(err, result) {
        mydb.equal(null, err);
    });
    var collection = db.collection('myList');
    collection.insertOne({"Name":"Swedish-Branch1", "Floor": "3rd", "Phone": "678-989-1200"}, function(err, result){
        mydb.equal(null, err);
    });
 //   db.close();
});

app.set('view engine', 'ejs');

function fetchAndRender(req,res){
    database.collection('hospitalList').find().toArray(function(err, result) {
        if (err) return console.log(err);
        hL = result;
        database.collection('myList').find().toArray(function (err, result) {
            if (err) return console.log(err);
            // renders hospitalList.ejs
            ul = result;
            res.render('hospitalList.ejs', {hospitalsList: hL, myList: ul});
        });
    });
}

app.post('/add', urlencodedParser, function (req, res) {
    //  console.log("/action_add called");
    var selectedHospital = req.body.hospitals;

    if(selectedHospital !== ""){
    var ary = selectedHospital.split(" ");
        // myListAdd
        // check for duplicates
        database.collection('myList').insertOne({"Name":ary[0], "Floor": ary[1], "Phone": ary[2]}, function(err, result){
           if(err){console.log("error inserting myList ");
           }else{
               fetchAndRender(req,res);
           }
        });
    }
});

app.post('/new', urlencodedParser, function (req, res) {
    //  console.log("/action_new called");
   var name = req.body.Name;
   var floor = req.body.Floor;
    var phone = req.body.Phone;
    // hospitalList creat new record
    // check for duplicates
    if(name !== "" && floor !== '' && phone !== '') {
        database.collection('hospitalList').insertOne({
            "Name": name,
            "Floor": floor,
            "Phone": phone
        }, function (err, result) {
            if (err) {
                console.log("error inserting hospitalList ");
            } else {
                fetchAndRender(req, res);
            }
        });
    }
});

app.get('/', function (req, res) {
    fetchAndRender(req,res);
});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!')
});



