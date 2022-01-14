require('dotenv').config();
const APP_NAME = process.env.WAWEB_SESSIONID

const logger = require("log4js")
	.configure({
		appenders: { SPVGA: { type: "stdout" } },
		categories: { default: { appenders: [APP_NAME], level: "debug" } }
	})
	.getLogger(APP_NAME);


const fs = require("fs")
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const MessagesAdapter = require('./MessagesAdapter')

if (!(fs.existsSync("./WWebJS") && fs.existsSync("./WWebJS/session-"+APP_NAME)) )
	logger.warn("Scan Next QR codes")

const client = new Client({ puppeteer: { args: ['--no-sandbox']}, clientId: APP_NAME });

(async _ => {
	await client.initialize();
})();

client.on('qr', (qr) => {
	qrcode.generate(qr, {small: true});
});

client.on('authenticated', _ => {
	logger.info('AUTHENTICATED');
});

// Fired if session restore was unsuccessful
client.on('auth_failure', (err) => {
	logger.error('AUTHENTICATION FAILURE', err);
});

client.on('ready', _ => {
	logger.info('READY');
});

client.on('disconnected', (reason) => {
	logger.fatal('DISCONNECTED', reason);
});

client.on('message', answerer);

function answerer(msg) {
	let msgText = String(msg.body.toLowerCase())
	//msg.reply(MessagesAdapter.findAnswer(msgText))
}

module.exports = client