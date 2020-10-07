var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ActiveSubsSchema = new Schema({
    token: {
        default: "undefined",
        type: String,
        unique: false,
        required: false
    }
  });

module.exports = mongoose.model('ActiveSubs', ActiveSubsSchema);
