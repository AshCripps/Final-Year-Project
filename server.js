const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true}));

app.get('/', function(req,res){
  res.render('index');
})

app.post('/', function (req, res){
  console.log.(req.body.Collection);
  res.render('index');
})

app.listen(3000, function(){
  console.log("Testing and listening on port 3000")
})
