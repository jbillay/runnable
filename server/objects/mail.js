/**
 * Created by jeremy on 23/11/14.
 */

'use strict';

var nodemailer = require('nodemailer');
var settings = require('./../../conf/config');

function mail() {
    if (settings.mail.service) {
        this.service = settings.mail.service;
    } else if (settings.mail.host) {
        this.host = settings.mail.host;
    } else {
        throw new Error('No email setup done');
    }
    this.user = settings.mail.user;
    this.password = settings.mail.password;
    this.transport = settings.mail.transport;
    this.from = settings.mail.from;
    this.to = settings.mail.to;
    this.bcc = settings.mail.bcc;
    this.subject = 'test';
    this.text = 'text';
    this.html = '<b>Test Email</b>';
    this.attachements = [];

    if (this.service) {
        this.smtpTransport = nodemailer.createTransport(this.transport, {
            service: this.service,
            auth: {
                user: this.user,
                pass: this.password
            }
        });
    } else if (this.host) {
        this.smtpTransport = nodemailer.createTransport(this.transport, {
            host: this.host,
            port: 587,
            use_authentication: true,
            user: this.user,
            pass: this.password
        });
    }
    this.mailOptions = null;
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
    this.attachements.push({filePath: filename});
};

mail.prototype.send = function () {
    this.mailOptions  = {
        from: this.from,
        to: this.to,
        bcc: this.bcc,
        subject: this.subject,
        text: this.text,
        html: this.html,
        attachments: this.attachements
    };

	if (settings.mail.send) {
		this.smtpTransport.sendMail(this.mailOptions, function (error, response) {
			if (error) {
				throw new Error('Impossible to send mail : ' + error);
			} else {
			    console.log('Message sent: ' + response.message);
            }
		});
	}
};

mail.prototype.close = function () {
    // if you don't want to use this transport object anymore, uncomment following line
    this.smtpTransport.close(); // shut down the connection pool, no more messages
};

module.exports = mail;