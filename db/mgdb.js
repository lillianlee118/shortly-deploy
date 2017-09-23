var mongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var url = 'mongodb://localhost:27017/shortly';

mongoose.connect(url);

var db = mongoose.connection;

var exports = module.exports;

exports.urlSchema = urlSchema = new mongoose.Schema(
  {
    url: String,
    baseUrl: String,
    code: String,
    title: String,
    visits: Number
  },
  {timestamps: true}
);

exports.userSchema = userSchema = new mongoose.Schema(
  {
    username: {type: String, unique: true },
    password: String
  },
  {timestamps: true}
);

exports.Url = Url = mongoose.model('Url', urlSchema);
exports.User = User = mongoose.model('User', userSchema);
