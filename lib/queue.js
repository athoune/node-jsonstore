var Queue = function(ctx) {
    this.queue = [];
    this.ctx = ctx;
    this.lock = false;
};

Queue.prototype.push = function(action) {
    this.queue.push(action);
    this._pop();
};

Queue.prototype._pop = function() {
    if (!this.lock && this.queue.length) {
        this.lock = true;
        var that = this;
        var ac = this.queue.shift();
        ac.call(this.ctx, function() {
            that.lock = false;
            that._pop();
        });
    }
};

exports.Queue = Queue;
