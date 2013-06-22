
/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , user = require('./routes/user')
    , http = require('http')
    , path = require('path');


var app = express();
var users = [];

// all environments
app.set('port', process.env.PORT || 3000);
app.set('socket_port', 3001);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({secret: 'clavesupersecretaquenadiesabe'}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/code', routes.index);
app.get("/", routes.index );
app.post('/register', routes.new_username);


var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var io = require("socket.io").listen(server);

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});

io.sockets.on('connection', function (socket) {

    socket.on ('conn', function (data) {
        socket.emit('message', { 
            message: data.username + ', Welcome to the chat' 
        });

        socket.broadcast.emit("message", { 
            message: data.username + " is connected"
        });

    });
    socket.on ('send', function (data) {
        if (data.message != "/clear")
            io.sockets.emit ('message', data);
        else {
            socket.emit ('message', { 
                message: "Hay " + users.length + " usuarios conectados. Limpiando!"
            });
            users = [];
        }
    });

});

