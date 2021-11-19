let express = require('express');
let router = express.Router();
let waGrpManager = require('../modules/wagroups-manager');
let dbManager = require('../modules/db-managment')
const {json} = require("express");
let groupColl = dbManager.db("SPVGA").collection("groups")

/* GET home page. */
router.get('/', (req, res) => {
	res.render('index', { title: 'Express' });
});

router.get('/hola', (req, res) => {
	//let usu = res.form.usuario
	res.render('index', { title: 'Hola Gustavo' });
});

router.put("/signup", (req, res) => {
	let name    = req.body.name,
		phone   = `521${req.body.phone}`,
		email   = req.body.email,
		inscription = req.body.inscription;
	
	let query = {academicgroup:"4bm1", class:"procesamiento de imagenes", major : "iia", school : "escom", institute : "ipn"}
	groupColl.findOne(query, {projection: {_id:1, wgroup:1}})
	.then(grpDbRow => new Promise((resolve, reject) => {
		if (grpDbRow)
			waGrpManager.getChatById(grpDbRow.wgroup)
				.then(waGrpChat => resolve(waGrpChat))
		// There's not group created                                                            self-adding at group
		else
			waGrpManager.createGroup(`${query.academicgroup.toUpperCase()} - ${query.class.toUpperCase()}`, [waGrpManager.info.wid._serialized])
				.then((waGrp) => waGrpManager.getChatById(waGrp.gid._serialized))
				.then(waGrpChat => {
					if (waGrpChat.isGroup) {
						query.wgroup = waGrpChat.id._serialized
						groupColl.insertOne(query, error => {
							if (error)
								reject(error)
							resolve(waGrpChat)
						})
					}
				})
		})
	)
	.then(async waGrpChat => {
		let phoneId = await waGrpManager.getNumberId(phone)
		
		let isParticipant = waGrpChat.participants
			.some(participant => participant.id._serialized===phoneId._serialized)
		
		return !isParticipant
			?waGrpChat.addParticipants([phoneId._serialized])
			:Promise.reject("phone already exists")
	})
	.then( grpInfo => {
		console.log(`resultado ${JSON.stringify(grpInfo, null, 4)}`)
		console.log(`status: ${grpInfo.status}`)
		grpInfo.participants.forEach((participant, i) => {
			console.log(`participante ${i}: ${participant}`)
		})
		res.sendStatus(200)
	})
		// @TODO: manejar tanto error de registro en bd y manejar en caso de usuario existente
	.catch( err => {
		console.error(`SPVGA: fallo en registro de grupo en bd: ${err}`)
		res.sendStatus(500)
	})
	
	
	
		
	
	
})

module.exports = router;
