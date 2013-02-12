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
                store.read(function(err) {
                    if (err) store.emit('error', err);
                });
            } // else file was deleted
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
    var data = fs.readFileSync(this.path, 'utf8');
    if (hash(data) !== that.hash) {
        that.data = JSON.parse(data);
        that.emit('refresh');
    }
    cb.call(that, null);
};

Store.prototype.write = function(cb) {
    var that = this;
    var tmp = this.path + '.tmp';
    //rm old tmp
    var data = JSON.stringify(this.data);

    fs.writeFileSync(tmp, data, 'utf8');
    fs.renameSync(tmp, that.path);
    that.hash = hash(data);
    that.emit('sync');
    cb.call(that, null);
};

exports.Store = Store;
