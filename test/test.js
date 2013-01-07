var should = require('should'),
    fs = require('fs'),
    jsonstore = require('../lib/jsonstore');

describe('Store', function() {
    var PATH = './test/toto.json';

    beforeEach(function(done){
        fs.writeFile(PATH, JSON.stringify({'beuha': 'Aussi'}), function(err) {
            if (err) throw err;
            done();
        })
    });
    describe('read', function() {
        it('should read test file', function(done) {
            var s = new jsonstore.Store('./test/toto.json', function() {
                s.data.beuha.should.eql('Aussi');
                done();
            });
        })
    })
});


