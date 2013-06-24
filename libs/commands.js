var commands = [
    "/clear",
    "/who",
    "/welcome",
    "/nowelcome",
    "/img",
    "/shout"    
];

var WELCOME = "welcome message";
var EMIT = "emit";

function _get_image_href (url) {
    return '<a href="'+url+'"><img class="chat-img" src='+url+' alt="" /></a>';
};

function _get_shout (str) {
    return '<h2 style="color: #AA0606;">' + str + '</h2>';
};


var is_command = function (text) {
    var aux = text.split(" ");
    if (aux[0] == "")
        return false;
    for (i in commands) {
        if (commands[i] == aux[0]) {
            var com = aux.splice (0,1);
            return [com, aux];
        }
    }
    return false;
};

var run = function (command, args) {
    /* Get the args all joins */
    if (command == "/welcome") {
        args = args.join (" ");
        return {
            type: "welcome message",
            args: args,
            emit: false
        };
    } else if (command == "/nowelcome") {
        return {
            type: "welcome message",
            args: undefined,
            emit: false
        };
    } else if (command == "/img") {
        var url = args[0];
        return {
            type: "emit",
            args: _get_image_href(url),
            emit: true
        };
    } else if (command == "/shout") {
        args = args.join (" ");
        return {
            type: "emit",
            args: _get_shout(args),
            emit:true
        };
    }
};

/* Exports */
exports.list = commands;
exports.run = run;
exports.isCommand = is_command;

/* Constants */
exports.WELCOME = WELCOME;
exports.EMIT = EMIT;
