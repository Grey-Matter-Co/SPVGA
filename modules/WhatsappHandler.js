const logger = require("log4js")
	.configure({
		appenders: { WWebJS: { type: "stdout" } },
		categories: { default: { appenders: ["WWebJS"], level: "ALL" } }
	})
	.getLogger("WWebJS");

const EventEmitter = require('events');


class WhatsappHandler {

	static EVENTS = {
		TEXT: "text",
		AUDIO: "audio",
		IMAGE: "image",
		VIDEO: "video",
	}

	/**
	 * @type {EventEmitter}
	 */
	_eventEmitter;


	constructor() {
		this._eventEmitter = new EventEmitter();
	}
	
	/**
	 * @param {WhatsappHandler.EVENTS.TEXT} event 
	 * @param {((userId, text)) => void} listener 
	 */
	on(event, listener)
		{ return this._eventEmitter.on(WhatsappHandler.EVENTS.TEXT, listener) }
	/**
	 * @param {WhatsappHandler.EVENTS.AUDIO} event 
	 * @param {((userId, audio, mimetype)) => void} listener 
	 */
	on(event, listener)
		{ return this._eventEmitter.on(WhatsappHandler.EVENTS.AUDIO, listener) }
	/**
	 * @param {WhatsappHandler.EVENTS.IMAGE} event 
	 * @param {(userId, image, mimetype) => void} listener 
	 */
	on(event, listener)
		{ return this._eventEmitter.on(WhatsappHandler.EVENTS.IMAGE, listener) }
	/**
	 * @param {WhatsappHandler.EVENTS.VIDEO} event 
	 * @param {(userId, video, mimetype) => void} listener 
	 */
	on(event, listener)
		{ return this._eventEmitter.on(WhatsappHandler.EVENTS.VIDEO, listener) }


	/**
	 * @param {string} userId 
	 * @param {string} text 
	 */
	emitText(userId, text) { 
		if (!this._eventEmitter.emit(WhatsappHandler.EVENTS.TEXT, userId, text) ) 
			logger.warn(`No listeners for TEXT from ${userId}`)
	}

	/**
	 * @param {string} userId 
	 * @param {String} audio base64 encoded audio
	 */
	emitAudio(userId, audio, mimetype) { 
		if (!this._eventEmitter.emit(WhatsappHandler.EVENTS.AUDIO, userId, audio, mimetype) ) 
			logger.warn(`No listeners for AUDIO from ${userId}`)
	}

	/**
	 * @param {string} userId 
	 * @param {string} image base64 encoded image
	 * @param {string} mimetype 
	 */
	emitImage(userId, image, mimetype) { 
		if (!this._eventEmitter.emit(WhatsappHandler.EVENTS.IMAGE, userId, image, mimetype) ) 
			logger.warn(`No listeners for IMAGe from ${userId}`)
	}

	/**
	 * @param {string} userId
	 * @param {string} video base64 encoded video
	 * @param {string} mimetype
	 */
	emitVideo(userId, video, mimetype) { 
		if (!this._eventEmitter.emit(WhatsappHandler.EVENTS.VIDEO, userId, video, mimetype) ) 
			logger.warn(`No listeners for VIDEO from ${userId}`)
	}
}

module.exports = WhatsappHandler;