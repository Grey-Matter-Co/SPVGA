require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const MessagesAdapter = require('./MessagesAdapter')

const TAG = "WAGroups"
const log = data => console.log(`${TAG}: ${data}`)
const error = data => console.error(`${TAG}: ${data}`)
const info = data => console.info(`${TAG}: ${data}`)
const assert = (condition, data) => console.assert(condition, `${TAG}: ${data}`)

let sessionCfg = JSON.parse(process.env.WW_SESSION || null);
if (!sessionCfg)
	info("Scan Next QR")

const client = new Client({ puppeteer: { args: [ '--no-sandbox', ]}, session: sessionCfg });

client.on('qr', qr =>
	qrcode.generate(qr, {small: true}));

client.on('authenticated', session => {
	info('AUTHENTICATED');
	assert(process.env.WW_SESSION, "WW_SESSION="+JSON.stringify(session))
	sessionCfg=session;
});

client.on('auth_failure', err => {
	sessionCfg = null;
	error('AUTHENTICATION FAILURE'+err)
});

client.on('ready', _ =>
	info('READY') );

client.on('disconnected', reason =>
	info("LOG OUT "+reason));

client.on('message', answerer);

client.initialize()
	.catch(error)

function answerer(msg) {
	let msgText = String(msg.body.toLowerCase())
	//msg.reply(MessagesAdapter.findAnswer(msgText))
}

module.exports = client