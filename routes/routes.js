
var express = require('express');
var routes = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var schedule = require('node-schedule');

var functions = require('./functions');

var Products = require('../products');
var Users = require('../users');
var activeSubs = require('../activeSubs');

var Query = require('./querywords');



module.exports = {

    getProducts: function(req, res, param=false){
      
      if(param){
        var query = param;
      }
      else{
        var query = req.params.name;
      }
    
      Products.findOne({ searchWord: query }, function (err, product) {
        if (err) {
          console.log(err);
          res.status(500).send();
        }
        else{
          if(product){

            var dateNow = new Date();
            if(product !== null){
              if(typeof product.timeAdded !== 'undefined'){
                  if (product.timeAdded.getTime() > dateNow.getTime()-86400000) {
                    if(!param){
                      res.json(product.details);  
                    }
                  }
                  else{
                    console.log('not there2');
                    functions.processData(req,res,param,procedure='update')
                  }
                }
            } 
            else{
              console.log('not there');
              functions.processData(req,res,param,procedure='update')
            }
          } 
          else{
          //Save data
          functions.processData(req,res,param,procedure='save')
          }
        }
      });
    },

    addUpdateUser: function(req,res){

        params = {
          subscriptions: req.body.subscriptions,
          notificationFrequency:req.body.notificationFrequency,
          isActiveSub:req.body.isActiveSub
        }
        if(params['subscriptions'] && params['notificationFrequency'] && params['isActiveSub']){
          Users.findOneAndUpdate(
            { token: req.params.token },
            {
              $set: params
            },
            { "upsert": true, "new": true },
            function (err, model) {
              if (err) throw err;
              return res.json(model);
            }
          )
        }
        else{
          res.status(404).send({
            'success' : false,
            'error' : "Not enough parameters"
          });
        }   
    },

    cancelSchedule: function(req,res){

      var token = req.params.token;
      var name = 'sendNotifications';
      
      if(token){
        name+= '&token='+ token
        functions.removeActiveSubs(token);
        schedule.scheduledJobs[name].cancel();
        
      }
      else{/*
var array=functions.removeActiveSubs(token=='undefined');

          for (i = 0; i < array.length; i++) {
            console.log(array[i]);
          }*/
      }

      result={
        success:"true",
        scheduling:"OFF"
      }

      if(token){
        result.user = token;
      }
      
      console.log('cancelled')
      res.json(result)
    }, 
    
    
    startTokenSchedule: function(req,res){

    Users.distinct( "subscriptions", function(error, ids) {
        
        for (i = 0; i < ids.length; i++) {
          module.exports.getProducts(req,res,ids[i])
          console.log(ids[i] + ' is checked')
        }

    });
      

      Users.aggregate([
        {
            $lookup: {
                from: "products",
                localField: "subscriptions",
                foreignField: "searchWord",
                as: "product_details"
            }
        },
        {
            $match: {
                "product_details": {$ne: []},
                "isActiveSub": {$eq: true}
            },
            
            
        },
        {$project: {
            token:'$token',
            product_details: '$product_details.details',
            searchWord: '$product_details.searchWord',
            notificationFrequency: '$notificationFrequency',
            lastSent: '$lastSent'
        }}
    ]).exec(function(err, results){

          userTokens=[];
          for (i = 0; i < results.length; i++) {

            console.log(i);

            Results = results[i];

            num = Results.notificationFrequency;

            var dateNow = new Date().getTime()-86400000*num;
            var lastSent = Results.lastSent.getTime();

          if (lastSent < dateNow) {

              //Send notification
              var products = functions.organizeProducts(Results.product_details,Results.searchWord)
        
              functions.sendNotificationv2(Results.token,products,Results.product_details[0][0].shopImage)
              functions.saveNotificationDate(Results.token);

            }
            
            console.log(num, new Date());

             //show the currently active subscriptions
             functions.saveActiveSubs(Results.token)
             userTokens.push(Results.token);
          }

          result={
            success:"true",
            scheduling:"ON",
            users:userTokens
          }

          if(res)
          res.json(result);

     })
    },

    sendNotification: function(req,res){
      product=req.params.name;
      token=req.body.token;
      functions.sendNotificationv2(token,product);
    },

    test: function(req,res){
      token=req.params.token;
      functions.saveNotificationDate(token);
    }

}