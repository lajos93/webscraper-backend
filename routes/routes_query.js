var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var schedule = require('node-schedule');

var functions = require('./functions');

var Products = require('../products');
var Users = require('../users');
var Query = require('./querywords');

router.post('/query/:queryword', function (req, res) {
  var NewQuery = Query({
    text: req.params.queryword,
  });

  NewQuery.save(function (err, success) {
    if (err) {
      res.json({ success: false, msg: 'Failed to save' })

    }
    else {
      res.json(success);
    }
  })

});


router.get('/query/:queryword', function (req, res) {
  Query.find(function (err, product) {
    let results = product.filter(x => x.text.startsWith(req.params.queryword));
    array = [];
    for (var key in results) {
      if (results.hasOwnProperty(key)) {
        array.push({ text: results[key].text, value: results[key]._id })
      }
    }
    res.json(array)
  });
});


router.get('/query/', function (req, res) {
  Query.find(function (err, product) {
    array = [];

    for (var key in product) {
      if (product.hasOwnProperty(key)) {
        array.push({ text: product[key].text, value: product[key]._id })
      }
    }
    res.json(array)
  });
});







module.exports = router_query;
