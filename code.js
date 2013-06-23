
var LT= "&lt;";
var GT = "&gt;";

function replace (text, from_raw_to_html) {
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
