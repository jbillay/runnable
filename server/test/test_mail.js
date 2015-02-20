/**
 * Created by jeremy on 06/02/15.
 */
'use strict';

var assert = require('chai').assert;
var Mail = require('../objects/mail');

describe('Test of inbox object', function () {
    it('Test to send an mail with service', function (done) {
        var mail = new Mail();
        mail.setTo('jbillay@gmail.com');
        mail.setSubject('Email des tests unitaires');
        mail.setContentHtml('<h2>Bonjour</h2>h2>');
        mail.setText('Bonjjour');
        mail.addAttachment('./fixtures/joins.json');
        mail.send();
        done();
    });
});