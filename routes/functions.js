var request = require('request');

var Products = require('../products');
var ActiveSubs = require('../activeSubs');
var Users = require('../users');

var cheerio = require('cheerio');

module.exports = {
    processData: function (req,res,param=false,procedure) {

        if(param){
          var searchWord = param;
        }
        else{
          var searchWord = req.params.name;
        }

        url = 'https://www.tilbudsugen.dk/Search/' + encodeURI(searchWord) + '/1' + '?lower_price=0&upper_price=100000&orderBy=pricePerUnit&userId=s&lat=1&lng=1&branches=';

        request(url, function (error, response, html) {
    
        var products = [];
        var htmlTable = JSON.parse(html).html;
        
        var i;
         for (i = 0; i < htmlTable.length; i++) {
           var $ = cheerio.load(htmlTable[i]);
     
           var div = $('div.row');
           var img = div.first().children().children().first().children().children().attr('data-src');
           var imgAlt = div.first().children().children().first().children().children().attr('alt');
           var name = div.first().children().eq(1).children().first().text();
           var shop = div.first().children().eq(1).children().children().first().text();
           var validity = div.first().children().eq(1).children().eq(2).text().replace(/(\r\n|\n|\r|\t)/gm,"");
           var totalDiscount = div.first().children().eq(2).children().children().first().children().first().text();
           var totalDiscountPCS = div.first().children().eq(2).children().children().first().children().eq(1).text().replace(/(\r\n|\n|\r|\t)/gm,"");
           
           products.push({
             shopImage: img,
             shopImageAlt: imgAlt,
             shopName : shop,
             product : name,
             validity : validity,
             totalDiscount : totalDiscount,
             totalDiscountPCS : totalDiscountPCS
             });
         }

         if(procedure='update'){
          //Save data
          module.exports.updateData(req,res,param,products)
          console.log('ready-to-update-data')
         }
         else{
          //Save data
          module.exports.saveData(req,res,param,products)
         }
          
         
 
       });
    },
    saveData: function (req,res,param=false,products=false) {
        var date = new Date();
        
        if(param){
          var searchWord = param;
        }
        else{
          var searchWord = req.params.name;
        }
     
        var NewProduct = Products({
          searchWord: searchWord,
          timeAdded: date,
          details: products
        });
    
        NewProduct.save(function (err, success) {
          if (err) {
            if(!param)
            res.json({ success: false, msg: 'Failed' })
    
          }
          else {
            if(!param)
            res.json(success.details);
          }
        })
    },
    updateData : function (req,res,param=false,products=false){

        var date = new Date();

        if(param){
          var searchWord = param;
        }
        else{
          var searchWord = req.params.name;
        }

        Products.findOneAndUpdate(
          { searchWord: searchWord },
          {
            $set: {
              details: products,
              timeAdded: date
            }
          },
          { "upsert": true, "new": true },
          function (err, model) {
            if (err) throw err;
            if(model){
              console.log('data-updated-successfully',model.details)
              if(!param){
                return res.json(model.details);
              }
            }
         
          }
        )
    },

    sendNotificationv2: function(token,prod_name,img=false){
    
      var myJSONObject =  {
          "notification":{
            "title":prod_name + ' is on sale',
            "image":img,
            "body":'Click for more', 
            "meta":{
            "type":"small",
            "info":"Search"
         }
          },
          "to" : token
      };
      
        request({
            url: "https://fcm.googleapis.com/fcm/send",
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Authorization": "key=AAAAL-8DaiE:APA91bEF1E5TkWOFXGgJt8wX2DBTbrk9FZkS7dBcUq9TuoZu4yu6loS8ureN9t1ZB76b2ktGEcl2K5hc4fzym6RF00e52mUmWiZaXTUxr_snoaQ8ydfACrs2uFVoL_tZ5mjTjwQ3_h62",
            },
            json: true,   // <--Very important!!!
            body: myJSONObject
        }, function (error, response, body){
            console.log(response.body);
            
        });
    },

    organizeProducts : function(products, searchwords) {

      var length = [];
      for (k = 0; k < products.length; k++) {
            length.push(products[k].length);
          }
  
      var searchWord = [];
      for (f = 0; f < searchwords.length; f++) {
        searchWord.push(searchwords[f]);
      } 

      var l = Math.min(searchWord.slice(0,2).length,length.slice(0,2).length),
              ret = [],
              i;

      for( i=0; i<l; i++) {
          var item_txt;
          if(length[i]==1){
            item_txt = 'item'
          }
          else{
            item_txt = 'items'
          }
          ret.push(searchWord[i]+"("+length[i]+" " + item_txt + ")");
      }
  
      return ret;
    },

    saveActiveSubs: function(token){

      ActiveSubs.findOne({ token: token }, function (err, foundToken) {

        if(!foundToken){
          
          var activeSub = ActiveSubs({
            token: token
          });

            activeSub.save(function (err, success) {
              if (err) 
              console.log('failed-to-add')
      
              console.log('added');
              
            })
          }
        })
    },

    removeActiveSubs: function(token=false){

      if(token){
        ActiveSubs.findOne({ token: token }, function (err, foundToken) {

          if(foundToken){
            
            var activeSub = ActiveSubs({
              token: token
            });
  
            ActiveSubs.remove({ token: token },function (err, success) {
                if (err) 
                console.log('failed-to-remove')
                if(success)
                console.log('removed');
                
              })
            }
          })
      }
      else if(token=='undefined'){
        ActiveSubs.find({}, function (err, foundTokens) {
          if(foundTokens){
            ActiveSubs.remove({},function (err, success) {
              if (err) 
              console.log('failed-to-remove')
              if(success)
              console.log('all-users-removed');
              
            })
            return(foundTokens);
          }          
        });
      }
    },

    saveNotificationDate: function(token){

        Users.findOneAndUpdate(
          { token: token },
          {
            $set: {
              lastSent: new Date(),
            }
          },
          { "upsert": true, "new": true },
          function (err, success) {
            if (err) throw err;
            if(success){
              console.log('added');
            }
         
          }
        )
    },
  }