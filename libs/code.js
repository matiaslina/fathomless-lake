// Firebase code
 var Firebase = require ('firebase'),
    firebase_root = new Firebase('https://fathomless-lake.firebaseio.com/'),
    firebase_code = firebase_root.child ('code');
var code = {
    code: "",
    setCode: function (str) {
        this.code = _replace(str, true);
        firebase_code.set ({ 
            code: this.code,
            language: "C"
        });
    },
    getRawCode: function () {
        return _replace (this.code, false);
    },
    getCode: function () {
        return this.code;
    }
};

var LT= "&lt;";
var GT = "&gt;";

function _replace (text, from_raw_to_html) {
    var splitted = text.split ("\n");
    if (from_raw_to_html) {
        for (line_n in splitted) {
            splitted[line_n] = splitted[line_n].replace("<",LT);
            splitted[line_n] = splitted[line_n].replace(">",GT);
        }
    } else {
        for (line_n in splitted) {
            splitted[line_n] = splitted[line_n].replace(LT, "<");
            splitted[line_n] = splitted[line_n].replace(GT,">");
        }
    }

    text = splitted.join ("\n");

    return text;
};

exports.Code = code;
