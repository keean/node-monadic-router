var Seq = require('./nseq.js').Seq;

var notFoundHandler = function(req, res) {
    return new Seq(function(succ, fail) {
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
    var prog = Seq.seq(notFoundHandler);

    prog(req, res).run(function() {}, function() {});
};

require('http').createServer(router).listen(8080);
