var should = require('should'),
    fs = require('fs'),
    jsonstore = require('../lib/jsonstore');

describe('Empty store', function() {
    var PATH = '/tmp/toto.json';
    it('should build an empty store', function(done) {
        fs.unlink(PATH, function() {
            var s = new jsonstore.Store(PATH, function() {
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
            var s = new jsonstore.Store(PATH, function() {
                this.data.beuha.should.eql('Aussi');
                done();
            });
        });
        it('should write stuff', function(done) {
            var s = new jsonstore.Store(PATH, function() {
                this.data.beuha = 42;
                this.on('refresh', function() {
                    throw Error('written, not refreshed.');
                });
                this.write(function() {
                    JSON.parse(fs.readFileSync(PATH)).beuha.should.eql(42);
                    done();
                });
            });
        });
    });
    describe('handling file watch', function() {
        it('should watch file changed', function(done) {
            var once = true;
            var s = new jsonstore.Store(PATH, function() {
                this.on('refresh', function() {
                    s.data.beuha.should.eql('plop');
                    if (once) {
                        once = false;
                        done();
                    }
                });
                fs.writeFile(PATH, JSON.stringify({'beuha': 'plop'}));
            });
        });
    });
});


