const logger = require("log4js")
	.configure({
		appenders: { WWebJS: { type: "stdout" } },
		categories: { default: { appenders: ["WWebJS"], level: "ALL" } }
	})
	.getLogger("WWebJS");

const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Chat, GroupChat, MessageMedia, MessageTypes } = require('whatsapp-web.js');
const WhatsappHandler = require('./WhatsappHandler.js')
// import Console from "./mConsole.js";
// const console = new Console("[whatsapp client]");

const ADMIND_NUMBERS = [
	"5215610338516@c.us",	// Emby
	"5215548258856@c.us",	// Dany
	"5215512468933@c.us",	// Vic
]

class WhatsappClient {
	/**
	 * @param {WhatsappHandler} whatsppHandler 
	 */
	constructor(whatsppHandler, onlyAdmins=true) {
		this.handler = whatsppHandler;
		this.client = new Client({
			authStrategy: new LocalAuth(),
			puppeteer: {
				// headless: false,
			}
		});
		this.client.on("qr", (qr) => {
			qrcode.generate(qr, { small: true });
		});
		this.client.on("auth_failure", (err) => {
			console.error("AUTHENTICATION FAILURE", err);
		});
		this.client.on("ready", () => {
			console.log("Conectado");
		});
		this.client.on("message", async (msg) => {
			if (onlyAdmins && !ADMIND_NUMBERS.includes(msg.from)) {
				console.warn(`Message from ${msg.from} denied`);
				return;
			}

			try { msg.react('👀') } 
			catch (err) { console.error(err) }

			let chat = await this.client.getChatById(msg.from)
			chat.sendStateTyping();

			switch (msg.type) {
				case MessageTypes.TEXT:
					console.log("Message received: ", msg.body);
					this.handler.emitText(msg.from, msg.body);
					break;
				case MessageTypes.AUDIO:
				case MessageTypes.VOICE:
					chat.sendStateRecording();
					let audio = await msg.downloadMedia();
					console.log("Audio received: ", audio.mimetype);
					this.handler.emitAudio(msg.from, audio.data, audio.mimetype);
					break;
				case MessageTypes.IMAGE:
					let image = await msg.downloadMedia();
					console.log("Media received: ", image.mimetype);
					this.handler.emitImage(msg.from, image.data, image.mimetype);
				case MessageTypes.VIDEO:
					let video = await msg.downloadMedia();
					console.log("Media received: ", video.mimetype);
					this.handler.emitVideo(msg.from, video.data, video.mimetype);
					break;
				default:
					console.warn("Message type not supported");
					break;
			}
		});
		this.client.initialize()
			.then(() => {
				this.client.sendPresenceAvailable()
				this.info = this.client.info;
			});
	}

	sendMessage(userId, message, error=false) {
		return this.client.getChatById(userId)
			.then(chat => chat.fetchMessages({fromMe:false, limit:1}))
			.then(messages => messages[0].react(error ? '❌' : '✅'))
			.then(() => this.client.sendMessage(userId, message))
			.catch(err => console.error("ERROR cachadoooo", err))
	}

	sendImage(userId, image) {
		let messageMedia = /* await */ new MessageMedia("image/png", image, "foo" + ".png");
		return this.client.sendMessage(userId, messageMedia, {
			caption: "Imagen recibida",
		}).catch(err => console.error("ERROR cachadoooo", err));
	}

	sendVideo(userId, video) {
		let messageMedia = /* await */ new MessageMedia("video/mp4", video, "foo" + ".mp4");
		return this.client.sendMessage(userId, messageMedia, {
			caption: "Video recibido",
		}).catch(err => console.error("ERROR cachadoooo", err));
	}

	sendAudio(userId, video) {
		let messageMedia = /* await */ new MessageMedia("audio/mp3", video, "foo" + ".mp3");
		return this.client.sendMessage(userId, messageMedia, {
			caption: "Audio recibido",
		}).catch(err => console.error("ERROR cachadoooo", err));
	}

	getChatById(userId) 
		{ return this.client.getChatById(userId); }

	async validateContact(phone) 
		{ return (await this.client.getNumberId(phone))??false; }

	createSchoolarGroup(course, teacher, schedule, group, participants) {
		// Validate participants (min 2)
		// if (participants.length < 2)
		// 	throw new Error("Participants must be at least 2");

		// create 
		return this.client.createGroup(group, participants, course, teacher, schedule)
			.then(waGrp => this.getChatById(waGrp.gid._serialized))
			.then(waChat => {
				// Sets subject
				/* return  */waChat.setDescription(`*Materia*: ${course}\n*Profesor*: ${teacher}\n*Horario:*\n${schedule}`)
				// 	.then(() => {
				// 		return this.getChatById(waChat.id._serialized)
				// 	})				
				return this.getChatById(waChat.id._serialized)
			})
	}

	stop() 
		{ return this.client.destroy(); }
}

// to import use: import myWhatsapp from "./myWhatsapp.js";
// export default WhatsappClient;
module.exports = WhatsappClient;