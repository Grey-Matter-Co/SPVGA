const express = require('express');
const router = express.Router();
const waGrpManager = require('../modules/wagroups-manager');
const dbManager = require('../modules/db-managment')
const classesColl = dbManager.db("SPVGA").collection("classes")


router.get('/', (req, res) => {
	res.render('index', { title: 'Express' });
});

router.get('/hola', (req, res) => {
	//let usu = res.form.usuario
	res.render('index', { title: 'Hola Gustavo' });
});

router.put("/signup", async (req, res) => {
	try {
		for (let classData of req.body.class) {
			let query = {
				institute:  req.body.institute,
				school:     req.body.school,
				career:     req.body.career,
				major:      req.body.major,
				period:     req.body.period,
				group:      classData.group,
				name:       classData.name
			}

			await classesColl.findOne(query, {projection: {_id: 1, _idwa: 1}})
				.then(classRes => new Promise((resolve, reject) => {
						if (classRes)
							waGrpManager.getChatById(classRes._idwa)
								.then(resolve)
						// There's not group created
						else                                                                                                                //  self-adding at group
							waGrpManager.createGroup(`${query.group}-${abbreviate(query.name, 25-query.group.length-1)}`, [waGrpManager.info.wid._serialized])
								.then(waGrp => waGrpManager.getChatById(waGrp.gid._serialized))
								.then(waChat => {
									if (waChat.isGroup) {
										// Sets subject
										waChat.setDescription(`*Profesor*: ${classData.teacher}\n*Horario:*\n${classData.schedule}`)
										// Register WhatsApp Group's id
										query._idwa = waChat.id._serialized
										classesColl.insertOne(query, error => {
											if (error)
												reject(error)
											resolve(waChat)
										})
									}
								})
					})
				)
				.then(async waChat => {
					let phoneId = await waGrpManager.getNumberId("521"+req.body.student.phone)

					let isParticipant = waChat.participants
						.some(participant => participant.id._serialized === phoneId._serialized)

					return !isParticipant
						? waChat.addParticipants([phoneId._serialized])
						: Promise.reject("phone already exists")
				})
				.then(grpInfo => {
					console.log(`resultado ${JSON.stringify(grpInfo, null, 4)}`)
					console.log(`status: ${grpInfo.status}`)
					grpInfo.participants.forEach((participant, i) => {
						console.log(`participante ${i}: ${participant}`)
					})
				})
		}
		res.status(200)
		//res.respondWith("Student Registered")
	}
	catch (err) {   // @TODO: manejar tanto error de registro en bd y manejar en caso de usuario existente
		console.error(`SPVGA: fallo en registro de grupo en bd: ${err}`)
		res.status(500)
		//res.respondWith(`SPVGA: fallo en registro de grupo en bd: ${err}`)
	}
})

const abbreviate = (str, maxlength) =>
	str.length<=maxlength
		? str
		: str.split(" ")
			 .filter((w,i, strA) => w.length>4 || (i===0 || i===strA.length-1))
			 .map(w => w.substr(0,1))
			 .toString()
			 .replace(/,/g,"")
			 .substr(0,maxlength)

module.exports = router;
