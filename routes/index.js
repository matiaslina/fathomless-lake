var http        = require ('http');
var GithubApi   = require ('github');
var Oauth2      = require ('oauth').OAuth2;
var Firebase    = require ('firebase');
var url         = require ('url');
var querystring = require ('querystring');

/* Initialization of github API plugin */
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

/* Firebase initialization */
var firebase_root = new Firebase('https://fathomless-lake.firebaseio.com/'),
    firebase_github = firebase_root.child('github_data');

function render_error (req, res, err) {
    req.session.auth_token = undefined
    res.render ('render-error', {
        title: 'Oops',
        error: err
    });
};

exports.index = function(req, res){
    firebase_github.once('value', function (data) {
        var gist_id = undefined;
        if (data.val() !== undefined)
        req.session.gist_id = data.val().id;

        if (req.session.auth_token) {
            var user;
            github.user.get ({}, function (err, user) {
                if (err) {
                    render_error (req, res, err);
                    return;
                }

                req.session["username"] = user.login;
                req.session["name"] = user.name;
                req.session["email"] = user.email;
                req.session["type"] = "Github";
                res.render('index', { 
                    user:           req.session.username,
                    enunciado:      "",
                    gist_id: req.session.gist_id
                });
            });
        } else if (req.session.logged) {
            res.render( 'index', {
                user: req.session.username,
                enunciado: "",
                gist_id: req.session.gist_id
            });
        } else {
            res.redirect("/login");
        }
    });
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

exports.create_gist_form = function (req, res) {
    res.render ("create-gist",{});
};

exports.create_gist_logic = function (req, res) {
    if (req.session.auth_token == undefined) {
        render_error (req, res,
                      "You need to login with your github account!");
        return;
    }
    var options = {};
    options["description"] = req.body.description;
    options["public"] = true
    options["files"] = {};
    options["files"][req.body.code_name] = {
        content: req.body.code
    };

    github.gists.create (options, function (err, gist) {
        if (err) {
            render_error (req, res, err);
            return;
        }
        console.log ("Data of the gist!");
        console.log (gist);
        firebase_github.set({
            id: gist.id,
            description: gist.description,
            url: gist.html_url,
            codeName: req.body.code_name
        });
    });
    res.redirect ("/");
}
exports.update_gist_form = function (req, res) {
    console.log("Searching in firebase!");
    firebase_github.once ('value', function (data) {
        console.log (data.val());
        if (data.val() !== null) {
            var gist = data.val();
            req.session.gist_id = gist.id;
            ID: gist.id;
            res.render ("update-gist",{
                id: gist.id,
                code_name: gist.codeName
            });
            return;
        }
    });
};

exports.update_gist_logic = function (req, res) {
    if (req.session.auth_token == undefined) {
        render_error (req, res,
                      "You need to login with your github account!");
        return;
    }
    var options = {};
    options["id"] = req.session.gist_id;
    options["description"] = req.body.description;
    options["public"] = true
    options["files"] = {};
    options["files"][req.body.code_name] = {
        content: req.body.code
    };

    github.gists.edit (options, function (err, gist) {
        if (err) {
            render_error (req, res, err);
            return;
        }
        console.log ("Data of the gist!");
        console.log (gist);
        firebase_github.set({
            id: gist.id,
            description: gist.description,
            url: gist.html_url,
        });
    });
    res.redirect ("/");
};;
