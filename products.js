
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ProductsSchema = new Schema({
  searchWord: {
      default: "undefined",
      type: String,
      unique: true,
      required: true
  },
  timeAdded:{
      type: Date,
      unique: false,
      required: false
  },
  details:
    [
        {
            shopImage: 'string' ,
            shopImageAlt: 'string' ,
            shopName : 'string' ,
            product :  'string' ,
            validity : 'string' ,
            totalDiscount : 'string' ,
            totalDiscountPCS : 'string' ,
            _id : false 
        }
      ]
});

module.exports = mongoose.model('Products', ProductsSchema);
