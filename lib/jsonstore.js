'use strict';
var events = require('events'),
    fs = require('fs'),
    crypto = require('crypto'),
    util = require('util');

function hash(data) {
    var shasum = crypto.createHash('md5');
    shasum.update(data);
    return shasum.digest('hex');
}

function watch(store) {
    return fs.watch(store.path, function(evt, filename) {
        fs.exists(store.path, function(exist) {
            if (exist) {
                setTimeout(store.read(function(err) {
                    if (err) store.emit('error', err);
                }), 1);
            } // else file was deleted
        });
    })}

var Queue = function(ctx) {
    this.queue = [];
    this.lock = false;
    this.ctx = ctx;
};

Queue.prototype.push = function(action, cb) {
    this.queue.push({action: action, cb: cb});
    this._pop();
};

Queue.prototype._pop = function() {
    if (!this.lock && this.queue.length) {
        this.lock = true;
        var that = this;
        var ac = this.queue.shift();
        ac.action(function() {
            ac.cb.call(that.ctx);
            that.lock = false;
            that._pop();
        });
    }
};

var Store = function(path) {
    this.path = path;
    this.data = {};
    this.queue = new Queue(this);
    this.hash = null;
    events.EventEmitter.call(this);
};

var store = function(path, cb) {
    var s = new Store(path);
    fs.exists(path, function(exist) {
        if (! exist) {
            fs.writeFile(path, '{}', function(error) {
                if (error) {
                    cb.call(s, error);
                    return;
                }
                cb.call(s, null);
            });
        } else {
            s.read(cb);
        }
    });
    return s;
};

util.inherits(Store, events.EventEmitter);

Store.prototype.read = function(cb) {
    var that = this;
    this.queue.push(function(next) {
        fs.readFile(that.path, 'utf8', function(error, data) {
            if (error) {
                cb(error);
                return;
            }
            var h = hash(data);
            if (h !== that.hash) {
                that.data = JSON.parse(data);
                that.hash = h;
                that.emit('refresh');
            }
            next();
        });
    }, cb);
};

Store.prototype.write = function(cb) {
    var that = this;
    var tmp = this.path + '.tmp';
    //rm old tmp
    var data = JSON.stringify(this.data);
    this.queue.push(function(next) {
        fs.writeFile(tmp, data, 'utf8', function(error) {
            if (error) {
                cb(error);
                return;
            }
            fs.rename(tmp, that.path, function(error) {
                if (error) {
                    cb(error);
                    return;
                }
                that.hash = hash(data);
                that.emit('sync');
                next();
            });
        });
    }, cb);
};

Store.prototype.empty = function(cb) {
    this.data = {};
    this.write(cb);
};

exports.store = store;
