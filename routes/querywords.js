
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var QuerySchema = new Schema({
    text: {
      default: "undefined",
      type: String,
  }
  
});






module.exports = mongoose.model('Query', QuerySchema);
