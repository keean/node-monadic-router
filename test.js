var m = require('./nseq.js');
var parse = require('url').parse;

var form1 = function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
        '<html><head><title>Form 1</title></head><body>\n'
        + '<h1>Form 1</h1>\n'
        + '<form><input type="submit"/><input type="hidden" name="continuation" value="1"/></form>\n'
        + '</body></html>\n'
    );
    return m.unit(req, res);
};

var form2 = function(req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(
        '<html><head><title>Form 2</title></head><body>\n'
        + '<h1>Form 2</h1>\n'
        + '</body></html>\n'
    );
    return m.unit(req, res);
};

var notFoundHandler = function(req, res) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(
        '<html><head><title>Error 404: Not Found</title></head><body>\n'
        + '<h1>Error 404: Not Found</h1>\n'
        + '<p>Cannot ' + req.method + ' ' + req.url + '</body></html>\n'
    );
    return m.unit(req, res);
}; 

var loga = function(req, res) {
    console.log("A");
    return m.unit(req, res);
};

var logb = function(req, res) {
    console.log("B");
    return m.unit(req, res);
};

var sessions = [];

var router = function(req, res) {
    var url = parse(req.url, true);

    if (url.pathname !== '/') {
        var prog = m.seq(notFoundHandler);
        prog(req, res).exec();
        return;
    }

    var prog = sessions[url.query.continuation];
    if (prog === undefined) {
        prog = m.seq(m.par(loga, logb), form1, m.getcc, form2);
    } 

    sessions[1] = prog(req, res).exec();
};

require('http').createServer(router).listen(8080);

