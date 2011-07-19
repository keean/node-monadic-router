var m = require('./nseq.js');

var parse = require('url').parse;

var sessions = [];

var ask = function(req, res) {
    return new m.Seq(function(succ, fail) {
        return succ;
    });
};

var form1 = function(req, res) {
    return new m.Seq(function(succ, fail) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
            '<html><head><title>Form 1</title></head><body>\n'
            + '<h1>Form 1</h1>\n'
            + '<form><input type="submit"/><input type="hidden" name="continuation" value="1"/></form>\n'
            + '</body></html>\n'
        );
        return succ(req, res);
    });
};

var form2 = function(req, res) {
    return new m.Seq(function(succ, fail) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(
            '<html><head><title>Form 2</title></head><body>\n'
            + '<h1>Form 2</h1>\n'
            + '</body></html>\n'
        );
        return succ(req, res);
    });
};

var notFoundHandler = function(req, res) {
    return new m.Seq(function(succ, fail) {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end(
            '<html><head><title>Error 404: Not Found</title></head><body>\n'
            + '<h1>Error 404: Not Found</h1>\n'
            + '<p>Cannot ' + req.method + ' ' + req.url + '</body></html>\n'
        );
        succ(req, res);
    });
};

var router = function(req, res) {
    var url = parse(req.url, true);
    if (url.pathname === '/') {
        var prog = sessions[url.query.continuation];
        console.log("continuation: " + url.query.continuation);
        console.log("continuation: " + sessions[parse(req.url, true).query.continuation]);

        if (prog === undefined) {
            prog = m.seq(form1, ask, form2, ask);
        }

        var next = prog(req, res).run;
        if (next !== undefined) {
            sessions[1] = next(m.id, m.id);
        } else {
            sessions[1] = undefined;
        }

        console.log("sessions[1]: " + sessions[1]);
    } else {
        var prog = m.seq(notFoundHandler);
        prog(req, res).run(m.id, m.id);
    }
};

require('http').createServer(router).listen(8080);

