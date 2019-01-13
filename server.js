const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

app.get('/', function(req,res){
  createConnection(function(err, dbo){
    if (err) {
      console.log("Broken", err);
    }
    var cursor2 = dbo.listCollections({}, {nameOnly:true}).toArray(function(err, results){
      if (err) throw err;
      console.log("Loading Collections");
      var arr = [];
      results.forEach(element => {
        arr.push(element.name);
      });
      console.log(arr);
      res.render('index', {rows:arr, selection:null});
    })
  })

  //res.render('index');
})

app.post('/', function(req,res){
  var selected = req.body.selectpicker
  console.log("Option picked is ", selected);
  res.render('index', {selection:selected, rows:arr});
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
  var cursor = dbo.collection("memory").find({}, {host: 1, type_instance: 1, values:1}).toArray( function(err, results){
    if (err) throw err;
    console.log("loading");
    console.log(results);
  })

  //, function(err, result) {
  //  if (err) throw err;
  //  console.log("Loading file");
  //  console.log(result);
    dbo.close;
}



function test(cb){
  createConnection(function(err, dbo){
    if (err) return cb(err);
    read(dbo);
    cb();
  })
}
