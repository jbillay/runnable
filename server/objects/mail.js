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
}

mail.prototype.init = function () {
    var deferred = q.defer();
    var that = this;
    var option = new Options();
    option.get('mailConfig')
        .then(function (config) {
            var settings = config;
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
};

mail.prototype.setTo = function (mail) {
    this.to = mail;
};

mail.prototype.setSubject = function (subject) {
    this.subject = subject;
};

mail.prototype.getSubject = function () {
    return this.subject;
};

mail.prototype.setContentHtml = function (html) {
    this.html = html;
};

mail.prototype.getContentHtml = function () {
    return this.html;
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
        console.log(new Error('No template defined'));
        deferred.reject(new Error('No template defined'));
    }

    option.get('emailTemplate')
        .then(function (value) {
            var html,
                text,
                title,
                find = 0,
                noHTML = /(<([^>]+)>)/ig,
                templates = value;
            templates.forEach(function (template) {
                if (template.name === templateName) {
                    find = 1;
                    html = template.html;
                    title = template.title;
                    Object.keys(keys).forEach(function (key) {
                        var tag = new RegExp('{{' + key + '}}', 'g');
                        html = html.replace(tag, keys[key]);
                        title = title.replace(tag, keys[key]);
                    });
                    text = html.replace(/<br\/>/g, '\r\n');
                    text = text.replace(noHTML, '');
                    that.html = html;
                    that.text = text;
                    that.subject = title;
                }
            });
            if (find === 0) {
                console.log(new Error('Not able to get template : ' + templateName));
                deferred.reject(new Error('Not able to get template : '+ templateName));
            } else {
                deferred.resolve(that);
            }
        })
        .catch(function (err) {
            console.log(new Error('Not able to get template : ' + err));
            deferred.reject(new Error('Not able to get template : ' + err));
        });
    return deferred.promise;
};

mail.prototype.send = function () {
    var deferred = q.defer();
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
                deferred.reject(new Error('Impossible to send mail : ' + error));
            } else {
                console.log('Message sent: ' + response.messageId);
                deferred.resolve('Message sent: ' + response.messageId);
            }
        });
    } else {
        deferred.resolve('Message not sent as configured');
    }
    return deferred.promise;
};

mail.prototype.sendEmail = function (template, values, email) {
    var that = this,
        deferred = q.defer();

    that.init()
        .then(function () {
            that.generateContent(template, values)
                .then(function () {
                    that.setTo(email);
                    that.send()
                        .then(function (res) {
                            deferred.resolve(res);
                        })
                        .catch(function (err) {
                            deferred.reject(new Error('Impossible to send mail : ' + err));
                        });
                })
                .catch(function (err) {
                    deferred.reject(new Error('Not able to get generate content : ' + err));
                });
        })
        .catch(function (err) {
            deferred.reject(new Error('Not able to init mail function : ' + err));
        });
    return deferred.promise;
};

module.exports = mail;