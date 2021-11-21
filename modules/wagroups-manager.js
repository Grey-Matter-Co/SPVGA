require('dotenv').config();
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

let sessionCfg = JSON.parse(process.env.WW_SESSION || null);
console.log(sessionCfg? "WAGroups: Session Found" : "WAGroups: Scan Next QR...");

const client = new Client({ puppeteer: { args: [ '--no-sandbox', ], }, session: sessionCfg });
const MessagesAdapter = require('./modules/MessagesAdapter')

client.initialize();

client.on('qr', qr => qrcode.generate(qr, {small: true}));

client.on('authenticated', (session) => {
	console.log('AUTHENTICATED');
	sessionCfg=session;
	if (!process.env.WW_SESSION)
		console.log("WW_SESSION="+JSON.stringify(session));
});

client.on('auth_failure', msg => {
	// Fired if session restore was unsuccessfull
	console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
	console.log('READY');
});

client.on('message', msg => {
	answerer(msg)
})

client.on('message_create', (msg) => {
	// Fired on all message creations, including your own
	if (msg.fromMe) {
		// do stuff here
	}
});

client.on('message_revoke_everyone', async (after, before) => {
	// Fired whenever a message is deleted by anyone (including you)
	console.log(after); // message after it was deleted.
	if (before) {
		console.log(before); // message before it was deleted.
	}
});

client.on('message_revoke_me', async (msg) => {
	// Fired whenever a message is only deleted in your own view.
	console.log(msg.body); // message before it was deleted.
});

client.on('message_ack', (msg, ack) => {
	/*
		== ACK VALUES ==
		ACK_ERROR: -1
		ACK_PENDING: 0
		ACK_SERVER: 1
		ACK_DEVICE: 2
		ACK_READ: 3
		ACK_PLAYED: 4
	*/
	
	if(ack === 3) {
		// The message was read
	}
});

client.on('group_join', async (notification) => {
	// User has joined or been added to the group.
	console.log('join', notification);
	await notification.reply('User joined.');
});

client.on('group_leave', async (notification) => {
	// User has left or been kicked from the group.
	console.log('leave', notification);
	await notification.reply('User left.');
});

client.on('group_update', (notification) => {
	// Group picture, subject or description has been updated.
	console.log('update', notification);
});

client.on('change_battery', (batteryInfo) => {
	// Battery percentage for attached device has changed
	const { battery, plugged } = batteryInfo;
	console.log(`Battery: ${battery}% - Charging? ${plugged}`);
});

client.on('change_state', state => {
	console.log('CHANGE STATE', state );
});

client.on('disconnected', (reason) => {
	console.log('Client was logged out', reason);
});

function answerer(msg) {
	let msgText = String(msg.body.toLowerCase())
	msg.reply(MessagesAdapter.findAnswer(msgText))
}

module.exports = client