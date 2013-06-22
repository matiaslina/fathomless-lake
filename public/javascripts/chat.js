window.onload = function () {
    var messages = [];
    var socket = io.connect('http://localhost:3000');
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
 
    sendButton.onclick = function() {
        var text = field.value;
        var author_v = name.value;
        socket.emit('send', { message: text, author: author_v });
    };
}
