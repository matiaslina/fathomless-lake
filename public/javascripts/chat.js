window.onload = function () {
    var messages = [];
    var socket = io.connect(window.location.hostname);
    var field = document.getElementById("field");
    var sendButton = document.getElementById("send");
    var content = document.getElementById("content");
    var name = document.getElementById ('name');
 
    socket.on('message', function (data) {
        if(data.message) {
            if (data.author == undefined) {
                data.author = "Server";
            }
            messages.push(data.author + ": " + data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
        } else {
            console.log("There is a problem:", data);
        }
    });

    function send () {
        var text = field.value;
        var author_v = name.value;
        if (author_v == "")
            alert ("Debe poner su nombre -_-");
        else {
            if (text != "")
                socket.emit('send', { message: text, author: author_v });

            field.value = "";
        }
    };
 
    sendButton.onclick = function() {
        send();
    };

    enterKey = function(e) {
        if (e.keyCode == 13) {
            send();
            return false;
        }
        return true;
    };
}
