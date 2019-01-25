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
      res.render('index', {rows:arr, selection:null, data:null, keys:null, chartData:null});
    })
  })

})

app.post('/collection', function(req,res){
  var selected = req.body.selectpicker;
  console.log("Option picked is ", selected);

  createConnection(function(err, dbo){
    if (err){
      console.log("Connection Failed", err);
    }
    dbo.collection(selected).find({}, {host: 1, types_instance: 1, values: 1}).limit(30).toArray(function(err, results){
      if (err) throw err;
      console.log("loading");
      var data = [];
      var keys = Object.keys(results[0]);
      results.forEach(element => {
        data.push(Object.values(element));
      })

      var chartData = {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
          'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      };

      res.render('index', {selection:selected, rows:arr, data:data, keys:keys, chartData:chartData});
    })
  })


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
