var should = require('should'),
    fs = require('fs'),
    Queue = require('../lib/queue').Queue,
    jsonstore = require('../lib/jsonstore');

describe('Queue', function() {
    it('should execute sequentially', function(done) {
        var ctx = new Object();
        var q = new Queue(ctx);
        var cpt = 0;
        q.push(function(next) {
            cpt += 1;
            process.nextTick(next);
        });
        q.push(function(next) {
            cpt.should.eql(1);
            done();
        });
    });
});

describe('Empty store', function() {
    var PATH = '/tmp/toto.json';
    it('should build an empty store', function(done) {
        fs.unlink(PATH, function() {
            var s = jsonstore.store(PATH, function() {
                this.data.should.eql({});
                done();
            });
        });
    });
});

describe('Store', function() {
    var PATH = './test/toto.json';

    beforeEach(function(done) {
        fs.writeFile(PATH, JSON.stringify({'beuha': 'Aussi'}), function(err) {
            if (err) throw err;
            done();
        });
    });
    describe('read/write', function() {
        it('should read test file', function(done) {
            var s = jsonstore.store(PATH, function() {
                this.data.beuha.should.eql('Aussi');
                done();
            });
        });
        it('should write stuff', function(done) {
            var s = jsonstore.store(PATH, function() {
                this.data.beuha = 42;
                this.write(function() {
                    JSON.parse(fs.readFileSync(PATH)).beuha.should.eql(42);
                    s.data.beuha.should.eql(42);
                    done();
                });
            });
        });
    });
});

describe('Use store', function() {
    var DATA = {
        '1': {'name': 'Bob', 'age': 42},
        '2': {'name': 'Tintin', 'age': 77}
    };
    var PATH = './test/toto.json';
    var store;

    beforeEach(function(done) {
        store = jsonstore.store(PATH, function(error) {
            if (error) throw error;
            this.data = DATA;
            done();
        });
    });
});
