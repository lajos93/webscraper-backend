var mongoose = require('mongoose');
var express = require('express');
var fs = require('fs');
var database = require('./database')
var request = require('request');
var cheerio = require('cheerio');
var cors = require('cors');
var bodyParser = require('body-parser');

var Schema = mongoose.Schema;

var app = express();
app.get('/',function(req,res) {
  res.sendFile(__dirname + '/index.html');
});
app.use(bodyParser.json());

var init = require('./routes/init');

var options = {
  useMongoClient: true
};
mongoose.Promise = global.Promise;
mongoose.connect(database.database, options);


app.use(cors());
app.use(init);
app.listen(process.env.PORT || 5555 ,function(){
    console.log("up and running on port "+process.env.PORT);
    console.log('Server is running')
});

console.log('ye ye yee');