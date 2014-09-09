var express = require('express'),
    http = require('http'),
    _ = require('underscore');

var app = exports.app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('port', 8001);
app.use(express.responseTime());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);


app.get('/index', require('./controllers/index.js'));

app.listen(8001, function(){
    console.log('listening');
});
