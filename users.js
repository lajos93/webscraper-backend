var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UsersSchema = new Schema({
    token: {
        default: "undefined",
        type: String,
        unique: true,
        required: true
    },
    subscriptions:
    [
       
    ],
    notificationFrequency: String,
    isActiveSub: {
      default: false,
      type: Boolean,
      unique: false,
      required: true
    },
    lastSent: {
      default: null,
      type: Date,
      unique: false,
      required: false
    },
  });

module.exports = mongoose.model('Users', UsersSchema);
