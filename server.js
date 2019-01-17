const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var arr = [];

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

app.get('/', function(req,res){
  arr = [];
  createConnection(function(err, dbo){
    if (err) {
      console.log("Broken", err);
    }
    var cursor2 = dbo.listCollections({}, {nameOnly:true}).toArray(function(err, results){
      if (err) throw err;
      console.log("Loading Collections");

      results.forEach(element => {
        arr.push(element.name);
      });
      console.log(arr);
      res.render('index', {rows:arr, selection:null});
    })
  })

})

app.post('/collection', function(req,res){
  var selected = req.body.selectpicker;
  console.log("Option picked is ", selected);
  test(selected);
  res.render('index', {selection:selected, rows:arr});
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

function read(dbo, coll, cb){
  var cursor = dbo.collection(coll).find({}, {host: 1, type_instance: 1, values:1}).toArray( function(err, results){
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



function test(coll, cb){
  createConnection(function(err, dbo){
    if (err) return cb(err);
    read(dbo, coll);
    cb();
  })
}
