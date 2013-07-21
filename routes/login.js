
exports.login = function (req, res) {
    if (req.session != undefined && req.session.auth_token)
        res.redirect("/");
    res.render ("username", {title:""});
};

exports.auth_github = function (req, res) {
    var query = querystring.parse (url.parse(req.url).query);
    oauth.getOAuthAccessToken (query.code, {}, 
        function (err, access_token, refresh_token) {
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
        }
    );
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
};
