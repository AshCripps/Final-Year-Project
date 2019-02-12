const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const uuidv4 = require('uuid/v4')

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";
var arr = [];
var checkOptions = [];
var selected = "";
var error = "";

app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}));
app.use(express.static('public'));

app.use(session({
  genid: function(req) {
    return uuidv4();
  },
  cookie: {maxAge: 1800000},
  secret: 'Monitoring Application',
  resave: true,
  saveUnitialized: false,
  store: new MongoStore({url: "mongodb://localhost/cookies"})
}));

app.get('/', function(req, res){
  res.render('login', {error:error});
})

app.post('/', function(req, res){
  var username = req.body.username;
  var password = req.body.pwd;
  var query = {username: username};
  connectAuth(function(err, dbo){
    if (err){
      error = err;
      res.redirect('/error');
    }
    var cursor = dbo.collection("users").find(query).limit(1).toArray(function(err, results){
      if (err) {
        error = err;
        res.redirect('/error');
      }
      if (results !== []){
        if (results[0].password === password){
          req.session.username = username;
          res.redirect('/home');
        } else {
          error = "Incorrect Password";
          res.redirect('/error');
        }
      }else {
        error = "Invalid Username or Password"
        res.redirect('/error');
      }
    })
  })
})

app.get('/home', function(req, res){
  if (req.session.username == null){
    err = "Please login";
    res.redirect("/");
  } else {
  arr = [];
  createConnection(function(err, dbo){
    if (err) {
      console.log("Broken", err);
      error = err;
      res.redirect('/error');
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
      res.render('index', {rows:arr, selection:selected, data:null, keys:null, chartData:null, checkOptions:checkOptions, username:req.session.username});
    })
  })
}
})

app.post('/collection', function(req, res){
  if (req.session.username == null){
    err = "Please login";
    res.redirect("/");
  } else {
  selected = req.body.selectpicker;
  console.log("Option picked is ", selected);

  createConnection(function(err, dbo){
    if (err){
      console.log("Connection Failed", err);
      error = err;
      res.redirect('/error');
    }
    if (selected !== ""){
      dbo.collection(selected).find({}, {host: 1, types_instance: 1, values: 1}).limit(30).toArray(function(err, results){
        if (err) {
          error = err;
          res.redirect('/error');
        }
        console.log("loading");

        checkOptions = []
        results.forEach(element => {
          if (!checkOptions.includes(element.type_instance)){ //Only add new options to the radio check
            checkOptions.push(element.type_instance);
          }
        })
        res.render('index', {selection:selected, rows:arr, chartData:null, checkOptions:checkOptions, username:req.session.username});
      })
    }else{
      error = "Please select a collection";
      res.redirect('/error');
    }
    })

}
})

app.post('/collection/graph', function(req, res){
  if (req.session.username == null){
    err = "Please login";
    res.redirect("/");
  } else {
  console.log(req.body.graphOption);
  var graphOption = req.body.graphOption;
  createConnection(function(err, dbo){
    if (err){
      console.log("Connection Failed", err);
      error = err;
      res.redirect('/error');
    }
    var query = {type_instance: graphOption};
    if (selected !== ""){
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

      res.render('index', {selection:selected, rows:arr, chartData:chartData, checkOptions:checkOptions, username:req.session.username});
    })
  } else{
    error = "Please select a collection";
    res.redirect('/error');
  }
  })
}
})

app.get('/logout', function(req, res){
  if (res.session){
    req.session.destroy();
    res.redirect('/');
  }
})

app.get('/error', function(req, res){
  res.render('error', {error:error});
  error = "";
})

app.get('*', function(req, res){
  error = "Page not found";
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

function connectAuth(cb){
  MongoClient.connect(url, {useNewUrlParser: true}, function(err, db) {
    if (err) throw err;
    var dbo = db.db("authentication");
    cb(null, dbo);
    db.close();
})
}
