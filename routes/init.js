


var express = require('express');
var init = express.Router();
var request = require('request');

var Query = require('./querywords');
var Products = require('../products');
var Users = require('../users');

var routes_get = require('./routes_get');
var routes = require('./routes');

var functions = require('./functions');


var schedule = require('node-schedule');



init.get('/prod/:name', function (req, res) {
  routes.getProducts(req,res)
});

init.post('/prod/:name', function (req, res) {
  routes.sendNotification(req,res)
});

init.put('/user/:token', function (req, res) {
  routes.addUpdateUser(req,res)
});

init.get('/startSchedule', function (req, res) {
  routes.startTokenSchedule(req,res)
});

init.get('/cancelSchedule', function (req, res) {
  //Should be checker whether its started or not
  routes.cancelSchedule(req,res)
});

init.get('/cancelSchedule/:token', function (req, res) {
  //Should be checker whether its started or not
  routes.cancelSchedule(req,res)
});

init.get('/test/:token', function (req, res) {
  //Should be checker whether its started or not
  routes.test(req,res)
});


routes.startTokenSchedule();
  
  module.exports = init;