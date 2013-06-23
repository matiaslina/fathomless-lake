window.onload = function () {
    var socket = io.connect(window.location.hostname);
    var submit_btn = document.getElementById("code_submit");
    var code_str = document.getElementById("codeTextarea");
    
    
    submit_btn.onclick = function () {
        socket.emit ('code submitted', {
            code: code_str.value
        });
    };
};
