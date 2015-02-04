/**
 * Created by jeremy on 30/11/14.
 */

"use strict";

var assert = require("chai").assert;
var request = require('request');
var sinon = require('sinon');
var Itra = require('../objects/itra.js');

describe('Test of itra object', function () {
    "use strict";
    var html = '<tbody><tr class="odd"><td><a href="?id=340083&nom=COURET#tab">Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr ><td><a href="?id=78273&nom=COURET#tab">Jacques-Andre COURET</a></td><td>Homme</td><td>France</td><td>1965</td></tr><tr class="odd"><td><a href="?id=267249&nom=COURET#tab">Jaques Andre COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr ><td><a href="?id=437314&nom=COURET#tab">Nicolas COURET</a></td><td>Homme</td><td>France</td><td>??</td></tr><tr class="odd"><td><a href="?id=84500&nom=COURET#tab">Richard COURET</a></td><td>Homme</td><td>France</td><td>1980</td></tr><tr ><td><a href="?id=489223&nom=DUCOURET#tab">Fabien DUCOURET</a></td><td>Homme</td><td>France</td><td>1978</td></tr><tr class="odd"><td><a href="?id=475698&nom=PICOURET#tab">Apollo PICOURET</a></td><td>Homme</td><td>France</td><td>1985</td></tr>				</tbody>';

    this.timeout(6000);

    before(function(done){
        sinon
            .stub(request, 'get')
            .yields(null, null, html);
        done();
    });

    after(function(done){
        request.get.restore();
        done();
    });

    it('Get user code from itra fake data', function (done) {
        var itra = new Itra("Richard", "Couret", null);
        itra.getCode(function (err, code) {
            if(err) return done(err);
            assert.equal(code, "?id=84500&nom=COURET#tab");
            done();
        });
    });
});