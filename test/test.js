var should = require('should'),
    fs = require('fs'),
    jsonstore = require('../lib/jsonstore');

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
                s.data.beuha.should.eql('Aussi');
                done();
            });
        });
        it('should write stuff', function(done) {
            var s = new jsonstore.Store(PATH, function() {
                s.data.beuha = 42;
                s.on('refresh', function() {
                    throw "written, not refreshed.";
                });
                s.write(function() {
                    JSON.parse(fs.readFileSync(PATH)).beuha.should.eql(42);
                    done();
                });
            });
        });
    });
    describe('handling file watch', function() {
        it('should watch file changed', function(done) {
            var s = new jsonstore.Store(PATH, function() {
                s.on('refresh', function() {
                    s.data.beuha.should.eql('plop');
                    done();
                })
                fs.writeFileSync(PATH, JSON.stringify({'beuha': 'plop'}));
            });
        });
    });
});


