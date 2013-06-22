
/*
 * GET home page.
 */
var http = require ('http');

exports.index = function(req, res){
    if (req.session.logged) {
        res.render('index', { 
            title: 'Fanthomless Lake Dev',
            user: req.session.username,
            enunciado: ""
        });
    } else {
        res.render ("username", { title: "Login"});
    }
};

exports.new_username = function (req, res) {
    if (req.body.new_username != "") {
        req.session.username = req.body.new_username;
        req.session.logged = true;
        
    } 
    res.redirect("/");
}
