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
        store.read(function(err) {
            if (err) store.emit('error', err);
        });
    })}

var Store = function(path, cb) {
    this.path = path;
    this.data = {};
    this.hash = null;
    events.EventEmitter.call(this);
    var that = this;
    var after = function() {
        that.watcher = watch(that);
        setTimeout(function() {
            that.read(cb);
        }, 5);
    };
    fs.exists(path, function(exist) {
        if (exist) {
            after();
        } else {
            fs.writeFile(path, '{}', after);
        }
    });
};

util.inherits(Store, events.EventEmitter);

Store.prototype.read = function(cb) {
    var that = this;
    fs.readFile(this.path, 'utf8', function(err, data) {
        if (err) {
            cb.call(that, err);
            return;
        }
        if (hash(data) !== that.hash) {
            that.data = JSON.parse(data);
            that.emit('refresh');
        }
        cb.call(that, null);
    });
};

Store.prototype.write = function(cb) {
    var that = this;
    var tmp = this.path + '.tmp';
    //rm old tmp
    var data = JSON.stringify(this.data);
    var d = hash(data);

    fs.writeFile(tmp, data, 'utf8', function(err) {
        if (err) {
            cb.call(that, err);
            return;
        }
        fs.rename(tmp, that.path, function(err) {
            if (err) {
                cb.call(that, err);
                return;
            }
            that.hash = d;
            that.emit('sync');
            cb.call(that, null);
        });
    });
};

exports.Store = Store;
