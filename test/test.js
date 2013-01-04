var should = require('should'),
    jsonstore = require('../lib/jsonstore');

describe('Store', function() {
    describe('read', function() {
        it('should read test file', function(done) {
            var s = new jsonstore.Store('./test/toto.json', function() {
                s.data.beuha.should.eql('Aussi');
                done();
            });
        })
    })
});


