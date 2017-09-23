var mongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var Promise = require('bluebird');

var url = 'mongodb://127.0.0.1:27017/shortly';
var db = mongoose.connection;

// LINK SCHEMA and BEHAVIOR =======
urlSchema = new mongoose.Schema(
  {
    url: String,
    baseUrl: String,
    code: String,
    title: String,
    visits: {type: Number, default: 0}
  },
  {timestamps: true}
);

urlSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0, 5);
  next();
});

// USER SCHEMA and BEHAVIOR ======
userSchema = new mongoose.Schema(
  {
    username: {type: String, unique: true },
    password: String
  },
  {timestamps: true}
);

userSchema.pre('save', function(next) {
  var cipher = Promise.promisify(bcrypt.hash);
  return cipher(this.password, null, null).bind(this)
    .then(function(hash) {
      this.password = hash;
      next();
    });
});

userSchema.methods.comparePassword = function(pwd) {
  console.log('comparing user password: ', pwd);
  var comp = Promise.promisify(bcrypt.compare);
  return comp(pwd, this.password).bind(this)
    .then((match) => match);
};

module.exports.Url = mongoose.model('Url', urlSchema);
module.exports.User = mongoose.model('User', userSchema);
mongoose.connect(url);
