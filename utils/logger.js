module.exports = function Logger(nameTAG){
	let self = this;
	const TAG = nameTAG
	const log = data => console.log(`${TAG}: ${data}`)
	const error = data => console.error(`${TAG}: ${data}`)
	const info = data => console.info(`${TAG}: ${data}`)
	const assert = (condition, data) => console.assert(condition, `${TAG}: ${data}`)
}