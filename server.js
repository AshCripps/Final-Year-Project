const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', function(req,res){
  res.render('index');
})

app.post('/', function (req, res){
  console.log(req.body.Collection);
  test(function(err){
    if (err){
      console.log("it done broked", err);
      process.exit(1);
    }
  })
  res.render('index');
})

app.listen(3000, function(){
  console.log("Testing and listening on port 3000")
})

function createConnection(cb){
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("collectd");
    cb(null, dbo);
})
}

function read(dbo, cb){
  dbo.collection("memory").findOne({}, function(err, result) {
    if (err) throw err;
    console.log("Loading file");
    console.log(result);
    db.close;
})
}

function test(cb){
  createConnection(function(err, dbo){
    if (err) return cb(err);
    read(dbo);
    cb();
  })
}
