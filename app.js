
/**
 * Module dependencies.
 */

var express = require('express')
    , routes = require('./routes')
    , code = require ('./libs/code')
    , commands = require ('./libs/commands')
    , http = require('http')
    , path = require('path')
    , request = require ('request')
    , Firebase = require ('firebase');

// Firebase root
var firebase_root = new Firebase('https://fathomless-lake.firebaseio.com/'),
    firebase_chat = firebase_root.child ('chat'),
    firebase_problem = firebase_root.child('problem'),
    firebase_code = firebase_root.child ('code');
var app = express();
var main_problem = {};
var welcome_message = undefined;


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
app.get ('/new_code', routes.code_submit);


var server = http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

var io = require("socket.io").listen(server);

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
  io.set ('log level', 1);
});

io.sockets.on('connection', function (socket) {

    socket.on ('conn', function (data) {
        // Get data from the chat.
        var fb_chat = firebase_chat.child(get_current_date())
        fb_chat.once('value', function (snap) {
            var prev_messages = "";
            var values = snap.val();
            for (var k in values) {
                prev_messages += '<div style="color: #555;">' + 
            values[k].author + ": " + values[k].message +
            '</div>';
            }
            if (prev_messages != "") {
                socket.emit ('message', {
                    author: "Previous Messages",
                    message: prev_messages
                });
            }
        });
        socket.emit('message', { 
            message: data.username + ', Welcome to the chat' 
        });

        socket.broadcast.emit("message", { 
            message: data.username + " is connected"
        });
        
        firebase_problem.once('value', function(data) {
            if (data.val() !== null) {
                var main_problem = data.val();
                socket.emit ('new problem', {
                    problem: main_problem.html, 
                    url: main_problem.url
                });
            }
        });
        
        if (welcome_message != undefined) {
            socket.emit ('message', {
                author: "Message of the day",
                message: welcome_message
            });
        }

        firebase_code.on ('value', function (data) {
            if (data.val() !== null) {
                socket.emit ('new code', {
                    code: data.val().code
                });
            }
        });

    });
    socket.on ('send', function (data) {
        var com;
        if ((com = commands.isCommand (data.message)) == false){
            io.sockets.emit ('message', data);
            // Store the data into the chat of today.
            var today = get_current_date();
            firebase_chat.child(today)
                         .child (Date.now())
                         .set ({
                             author: data.author,
                             message:data.message
                         });
        } else {
            var ret = commands.run (com[0], com[1]);
            if (ret.type == commands.WELCOME) {
                welcome_message = ret.args;
            }
            if (ret.emit) {
                socket.emit ('message', {
                    author: data.author,
                    message: ret.args
                });
            }
        }
    });
    
    socket.on ('submit problem', function (data) {
        request (data.url, function (error, res, body) {
            if (! error) {
                var pr = "";
                var inicio = '<div class="ttypography">';
                body = body.split('\n');
                for (i = 0; i < body.length; i++) {
                    console.log (body[1]);
                    if (body[i].indexOf(inicio) == 0){
                        pr = body[i];
                        io.sockets.emit ("new problem", { problem: pr})
                        firebase_problem.set({
                            url: data.url,
                            html: pr
                        });
                        break;
                    }
                }
            }
        });
    });
    
    /* When someone submit a new code */
    socket.on ('code submitted', function (data) {
        code.Code.setCode (data.code);
        console.log ("Code -> " + data.code);
        console.log ("code setted -> " + code.Code.getCode());
        io.sockets.emit ('new code', {
            code: code.Code.getCode()
        });
    });
});

function get_current_date () {
    var d = new Date();
    return d.getDate() + "-" + (d.getMonth()+1) + "-" + d.getFullYear();
};
