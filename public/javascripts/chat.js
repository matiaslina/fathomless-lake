window.onload = function () {
    var messages = [];
    var socket = io.connect(window.location.hostname);
    var field = document.getElementById("field");
    var content = document.getElementById("content");
    var name = document.getElementById ('name');
    var new_problem_url = document.getElementById('new_problem');
    var codeforces = document.getElementById('codeforces');
    
    socket.emit ('conn', {
        username: name.value
    });
 
    socket.on('message', function (data) {
        if(data.message) {
            if (data.author == undefined) {
                data.author = "Server";
            }
            messages.push("<b>" + data.author + ":</b> " + data.message);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += messages[i] + '<br />';
            }
            content.innerHTML = html;
            content.scrollTop = content.scrollHeight;
        } else {
            console.log("There is a problem:", data);
        }
    });
    
    socket.on ('new problem', function (data) {
        if (data.url != undefined) {
            new_problem_url.value = data.url;
        }
        if (data.problem != undefined)
            codeforces.innerHTML = data.problem;
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
 
    field.onkeypress = function(e) {
        if (e.keyCode == 13) {
            send();
            return false;
        }
        return true;
    };
    
    submit_problem.onclick = function () {
        socket.emit('submit problem', {url: new_problem_url.value});
    };
}
