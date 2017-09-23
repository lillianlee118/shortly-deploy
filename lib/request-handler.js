var util = require('../lib/utility');
var {User, Url} = require('../app/models');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Url.find().then(function(links) {
    res.status(200).send(links);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  uri = uri.startsWith('http') ? uri : 'http://' + uri;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Url.findOne({ url: uri }).then(function(found) {
    if (found) {
      res.status(200).send(found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }
        var newLink = new Url({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        });
        newLink.save().then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;
  User.findOne({username: username})
    .then(function(user) {
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password).then(match => {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        });
      }
    });
};

exports.signupUser = function(req, res) {
  console.log('Signing up new user: ');
  var username = req.body.username;
  var password = req.body.password;
  console.log('user: ', username, ' password: ', password);

  User.findOne({username: username}).then(function(user) {
    if (!user) {
      var newUser = new User({
        username: username,
        password: password
      });
      newUser.save()
        .then(function(newUser) {
          util.createSession(req, res, newUser);
        });
    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};

exports.navToLink = function(req, res) {
  Url.findOne({ code: req.params[0] }).then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits = link.visits + 1;
      link.save()
        .then(function() {
          return res.redirect(link.get('url'));
        });
    }
  });
};
