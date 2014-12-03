var express = require('express'),
    http = require('http'),
    path = require('path'),    
    _ = require('underscore');

var app = exports.app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('port', 8001);
app.use(express.responseTime());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get('/', require('./controllers/index.js'));
app.get('/errorrates', require('./controllers/errorrates.js'));
app.post('/addtiming', require('./controllers/add.js'));
app.post('/finderrorrates', require('./controllers/finderrorrates.js'));
app.post('/covariance', require('./controllers/covariance.js'));

app.listen(8001, function(){
    console.log('listening on 8001');
});
