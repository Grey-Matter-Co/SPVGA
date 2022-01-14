require('dotenv').config();
const logger = require("log4js")
	.configure({
		appenders: { WWebJS: { type: "stdout" } },
		categories: { default: { appenders: ["WWebJS"], level: "debug" } }
	})
	.getLogger("WWebJS");

const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const MessagesAdapter = require('./MessagesAdapter')

let sessionCfg = JSON.parse(process.env.WW_SESSION || null);
if (!sessionCfg)
	logger.warn("Scan Next QR codes")

const client = new Client({ puppeteer: { args: [ '--no-sandbox', ]}, session: sessionCfg });

(async _ => {
	await client.initialize();
})();

client.on('qr', (qr) => {
	qrcode.generate(qr, {small: true});
});

client.on('authenticated', session => {
	logger.info('AUTHENTICATED');
	if (!process.env.WW_SESSION)
		logger.warn("WW_SESSION="+JSON.stringify(session))

	process.env.WW_SESSION = session
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

client.on('message',async msg => {
	if (!(await msg.getChat()).isGroup) {
		logger.debug(`msg ${msg}`)
		answerer(msg)
	}
});

function answerer(msg) {
	let msgText = String(msg.body.toLowerCase())
	msg.reply(MessagesAdapter.findAnswer(msgText))
}

module.exports = client