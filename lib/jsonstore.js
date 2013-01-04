var events = require("events"),
    fs = require("fs"),
    util = require("util");

var Store = function(path, cb) {
    this.path = path;
    this.data = {};
    events.EventEmitter.call(this);
    this.read(cb);
}

util.inherits(Store, events.EventEmitter);

Store.prototype.read = function(cb) {
    var that = this;
    fs.readFile(this.path, 'utf8', function(err, data) {
        if (err) throw err;
        that.data = JSON.parse(data);
        that.emit('refresh');
        cb();
    });
};

Store.prototype.write = function(cb) {
    var that = this;
    var tmp = this.path + '.tmp';
    //rm old tmp
    fs.writeFile(tmp, JSON.stringify(this.data), 'utf8', function(err) {
        if (err) throw err;
        fs.rename(tmp, that.path, function(err) {
            if (err) throw err;
            that.emit('sync');
            cb();
        })
    });
}

exports.Store = Store;
