//------------------------------------------------------------------------
// Monadic Event Sequencing using ErrorContinuation Monad

var id = function(x) {return x;};
exports.id = id;

var Seq = function(x) {
    this.run = x; // function(sk, ek) {return x(sk, ek);};
};
exports.Seq = Seq;

Seq.prototype.exec = function() {
    return this.run(function() {}, function() {});
};

var seq = function() {
    var m = arguments;
    return function() {
        var l = m.length,
            n = m[0].apply(m[0], arguments);
        for (var i = 1; i < l; i++) {
            n = n.bind(m[i]);
        }
        return n;
    };
};
exports.seq = seq;

var par = function() {
    var t = this, m = arguments;
    return function() {
        var a = arguments;
        return new Seq(function(sk, ek) {
            console.log("PAR");
            var s = this;
            var l = m.length,
                r = [],
                z = undefined,
                x = 0,
                join = function() {
                    r = r.concat(Array.prototype.slice.call(arguments));
                    if (++x >= l) {
                        console.log("JOIN: " + r);
                        return sk.apply(s, r);
                    }
                };
            for (var i = 0; i < l; i++) {
                if (z == undefined) {
                    z = m[i].apply(t, a).run(join, ek);
                } else {
                    m[i].apply(t, a).run(join, ek);
                }
            }
            console.log("CONT: " + z);
            return z;
        });
    };
};
exports.par = par;

var alt = function(cond, ft, ff) {
    var m = this;
    return new Seq(function(sk, ek) {
        return m.run(function() {
            if (cond && ft) {
                return ft.run(sk, ek);
            } else if (ff) {
                return ff.run(sk, ek);
            }
        }, ek);
    });
};
exports.alt = alt;

Seq.prototype.unbox = function() {
    return this.run(id, id);   
};

// Functor
Seq.prototype.fmap = function(f) {
    var m = this;
    return new Seq(function(sk, ek) {
        return m.run(function() {
            return sk.call(m, f.apply(m, arguments));
        }, ek);
    });
};

// Functor => Pointed
var unit = function() {
    var m = this, a = arguments;
    return new Seq(function(sk, ek) {
        return sk.apply(m, a);
    });
};
exports.unit = unit;

// Pointed => Applicative
Seq.prototype.product = function(f) {
    var m = this;
    return new Seq(function(sk, ek) {
        return m.run(function(a) {
            return f.run(function() {
                return sk.call(m, a.apply(m, arguments));
            }, ek);
        }, ek);
    });
};

// Applicative => Monad
Seq.prototype.bind = function(f) {
    var m = this;
    return new Seq(function(sk, ek) {
        return m.run(function() {
            return f.apply(m, arguments).run(sk, ek);
        }, ek);
    });
};

// Monoid, Applicative => Alternative, Monad => MonadZero
var zero = function() {
    var m = this;
    return new Seq(function(sk, ek) {
        return ek.apply(m);
    });
};
exports.zero = zero;

// Monoid, Applicative => Alternative, Monad => MonadPlus
Seq.prototype.plus = function(f) {
    var m = this;
    return new Seq(function(sk, ek) {
        return m.run(sk, function() {
            return f.run(sk, ek);
        });
    });
};

// Monad => Error
var fail = function() {
    var m = this, a = arguments;
    return new Seq(function(sk, ek) {
        return ek.apply(m, a);
    });
};
exports.fail = fail;

// Monad => Error
Seq.prototype.trap = function(f) {
    var m = this;
    return new Seq(function(sk, ek) {
        return m.run(sk, function() {
            return f.apply(m, arguments).run(sk, ek);
        });
    })
};

var callcc = function(f) {
    return new Seq(function(succ, fail) {
        return f(function() {
            var m = this, a = arguments;
            return new Seq(function() {
                return succ.apply(m, a);
            });
        }).run(id, id);
    });
};
exports.callcc = callcc;

var getcc = function() {
    return callcc(function(k) {
        return unit(k);
    });
};
exports.getcc = getcc;


