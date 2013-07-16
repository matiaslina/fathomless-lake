var http = require ('http');
var GithubApi = require ('github');
var Oauth2 = require ('oauth').OAuth2;
var url = require ('url');
var querystring = require ('querystring');

var github = new GithubApi ({
    version: '3.0.0'
});

var client_id = '3d1a0a37cf111b55bbf4';
var secret = '3d2c018e847d0c3a961f4901a21688a156ed0210';

var oauth = new Oauth2 (
        client_id, 
        secret,
        "https://github.com/", 
        "login/oauth/authorize", 
        "login/oauth/access_token"
        );

exports.index = function(req, res){
    if (req.session.auth_token) {
        var user;
        github.user.get ({}, function (err, u) {
            user = u;
            console.log (u);
        });

        console.log (user);
        res.render('index', { 
            title: 'Fanthomless Lake Dev',
            user: req.session.username,
            enunciado: "",
            mygh: user
        });
    } else {
        res.redirect("/login");
    }
};

exports.login = function (req, res) {
    if (req.session != undefined && req.session.auth_token)
        res.redirect("/");
    res.render ("username", {title:""});
};

exports.auth_github = function (req, res) {
    var query = querystring.parse (url.parse(req.url)
            .query);
    oauth.getOAuthAccessToken (query.code, {}, function (err, access_token, refresh_token) {
        if (err) {
            console.log (err);
            res.writeHead (500);
            res.end (err + "");
            return;
        }

        req.session.auth_token = access_token;

        github.authenticate ({
            type: 'oauth',
            token: req.session.auth_token
        });

        res.redirect ("/");
    });
};

exports.register_normal = function (req, res) {
    if (req.body.new_username != "") {
        req.session.username = req.body.new_username;
        req.session.logged = true;
        res.redirect("/");
    }
};

exports.register_github = function (req, res) {
    res.writeHead (303, {
        Location: oauth.getAuthorizeUrl ({
            redirect_uri: 'http://localhost:3000/auth/github',
            scope: 'gist'
        })
    });
    res.end();
    return;
}


exports.code_submit = function(req, res){
    res.render ("code", {});
};
