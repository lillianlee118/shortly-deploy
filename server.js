var app = require('./server-config.js');

var port = 3000; // port on server that is open is 3000

app.listen(port);

console.log('Server now listening on port ' + port);
