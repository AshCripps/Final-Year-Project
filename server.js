const express = require('express');
const app = express();
const bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var arr = [];
var checkOptions = [];
var selected = "";
var error = "";

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('login');
})

app.post('/', function(req, res){
  res.redirect('/home')
})

app.get('/home', function(req, res){
  arr = [];
  createConnection(function(err, dbo){
    if (err) {
      console.log("Broken", err);
      error = err;
      res.redirect('/error');
      console.log("Broken", err);
    }
    var cursor2 = dbo.listCollections({}, {nameOnly:true}).toArray(function(err, results){
      if (err) {
        error = err;
        res.redirect('/error');
      }
      console.log("Loading Collections");

      results.forEach(element => {
        arr.push(element.name);
      });
      console.log(arr);
      res.render('index', {rows:arr, selection:selected, data:null, keys:null, chartData:null, checkOptions:checkOptions});
    })
  })

})

app.post('/collection', function(req, res){
  selected = req.body.selectpicker;
  console.log("Option picked is ", selected);

  createConnection(function(err, dbo){
    if (err){
      console.log("Connection Failed", err);
      error = err;
      res.redirect('/error');
    }
    if (selected !== null){
      dbo.collection(selected).find({}, {host: 1, types_instance: 1, values: 1}).limit(30).toArray(function(err, results){
        if (err) {
          error = err;
          res.redirect('/error');
        }
        console.log("loading");
        var chartData = [];
        var timestampData = [];
        checkOptions = []
        results.forEach(element => {
          timestampData.push(element.timestamp);
          chartData.push(element.values);
          if (!checkOptions.includes(element.type_instance)){ //Only add new options to the radio check
            checkOptions.push(element.type_instance);
          }
        })
        res.render('index', {selection:selected, rows:arr, chartData:null, checkOptions:checkOptions});
      })
    }else{
      error = "Please select a collection";
      res.redirect('/error');
    }
    })


})

app.post('/collection/graph', function(req, res){
  console.log(req.body.graphOption);
  var graphOption = req.body.graphOption;
  createConnection(function(err, dbo){
    if (err){
      console.log("Connection Failed", err);
      error = err;
      res.redirect('/error');
    }
    var query = {type_instance: graphOption};
    if (selected !== null){
    dbo.collection(selected).find(query, {host: 1, types_instance: 1, values: 1}).limit(30).toArray(function(err, results){
      if (err) {
        error = err;
        res.redirect('/error');
      }
      console.log("loading");
      var chartData = [];
      var timestampData = [];
      results.forEach(element => {
        timestampData.push(element.timestamp);
        chartData.push(element.values);
      })

      var chartData = {
        labels: timestampData,
        datasets: [{
          label: graphOption,
          data: chartData,
          backgroundColor: [
          'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)'
          ],
          borderWidth: 1
        }]
      };

      res.render('index', {selection:selected, rows:arr, chartData:chartData, checkOptions:checkOptions});
    })
  } else{
    error = "Please select a collection";
    res.redirect('/error');
  }
  })
})

app.get('/error', function(req, res){
  res.render('error', {error:error});
  error = "";
})

app.get('*', function(req, res){
  res.redirect('/error');
})

app.listen(3000, function(){
  console.log("Testing and listening on port 3000")
})

function createConnection(cb){
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("collectd");
    cb(null, dbo);
    db.close();
})
}
