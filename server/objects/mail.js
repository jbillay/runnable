/**
 * Created by jeremy on 23/11/14.
 */

'use strict';

var nodemailer = require('nodemailer');
var Options = require('./option');
var q = require('q');

function mail() {
    this.smtpTransport = null;
    this.user = null;
    this.password = null;
    this.transport = null;
    this.from = null;
    this.to = null;
    this.bcc = null;
    this.toSend = null;
    this.subject = 'test';
    this.text = 'text';
    this.html = '<b>Test Email</b>';
    this.attachements = [];
    this.mailOptions = null;
    var deferred = q.defer();
    var that = this;
    var option = new Options();
    option.get('mailConfig')
        .then(function (config) {
            var settings = JSON.parse(config);
            if (settings.service) {
                that.service = settings.service;
            } else if (settings.host) {
                that.host = settings.host;
            } else {
                console.log(new Error('No email setup done'));
            }
            that.user = settings.user;
            that.password = settings.password;
            that.transport = settings.transport;
            that.from = settings.from;
            that.to = settings.to;
            that.bcc = settings.bcc;
            that.toSend = settings.send;

            if (that.service) {
                that.smtpTransport = nodemailer.createTransport({
                    service: that.service,
                    auth: {
                        user: that.user,
                        pass: that.password
                    }
                });
            } else if (that.host) {
                that.smtpTransport = nodemailer.createTransport({
                    host: that.host,
                    port: 587,
                    auth: {
                        user: that.user,
                        pass: that.password
                    }
                });
            }
            deferred.resolve(that);
        })
        .catch(function (err) {
            console.log(new Error('Not able to get email config : ' + err));
            deferred.reject(new Error(err));
        });
    return deferred.promise;
}

mail.prototype.setTo = function (mail) {
    this.to = mail;
};

mail.prototype.setSubject = function (subject) {
    this.subject = subject;
};

mail.prototype.setContentHtml = function (html) {
    this.html = html;
};

mail.prototype.setText = function (texte) {
    this.text = texte;
};

mail.prototype.addAttachment = function (filename) {
    this.attachements.push({filepath: filename});
};

mail.prototype.generateContent = function (templateName, keys) {
    var that = this,
        deferred = q.defer(),
        option = new Options();

    if (templateName === null) {
        console.log(new Error('Template name ' + templateName + ' is not correct'));
        deferred.reject(new Error('Template name ' + templateName + ' is not correct'));
    }

    option.get('emailTemplate')
        .then(function (value) {
            var html,
                text,
                noHTML = /(<([^>]+)>)/ig,
                templates = JSON.parse(value);
            templates.forEach(function (template) {
                if (template.name === templateName) {
                    html = template.html;
                    Object.keys(keys).forEach(function (key) {
                        var tag = new RegExp('{{' + key + '}}', 'g');
                        html = html.replace(tag, keys[key]);
                    });
                    text = html.replace(/<br\/>/g, '\r\n');
                    text = text.replace(noHTML, '');
                    that.html = html;
                    that.text = text;
                }
            });
            deferred.resolve(that);
        })
        .catch(function (err) {
            console.log(new Error('Not able to get template : ' + err));
            deferred.reject(new Error('Not able to get template : ' + err));
        });
    return deferred.promise;
};

mail.prototype.send = function () {
    this.mailOptions = {
        from: this.from,
        to: this.to,
        bcc: this.bcc,
        subject: this.subject,
        text: this.text,
        html: this.html,
        attachments: this.attachements
    };

    if (this.toSend) {
        this.smtpTransport.sendMail(this.mailOptions, function (error, response) {
            if (error) {
                console.log(new Error('Impossible to send mail : ' + error));
            } else {
                console.log('Message sent: ' + response.message);
            }
        });
    }
};

module.exports = mail;