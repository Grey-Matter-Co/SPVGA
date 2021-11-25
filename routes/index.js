const express = require('express');
const router = express.Router();
const waGrpManager = require('../modules/wagroups-manager');
const dbManager = require('../modules/db-managment')
const classesColl = dbManager.db("SPVGA").collection("classes")
const RESCODE = {
	SUCCESS: {
		// @TODO implement
		// description: student was registered in all wa-groups
		REGISTERED_FULL: {
			code: 200,
			name: "registered_full"
		},
		// @TODO implement
		/**
		 * @description student was registered in some wa-groups
		 * @param total {Number}
		 * @param grps_registered {Number}
		 **/
		REGISTERED_PARTIAL: (total, grps_registered) => {
			return {
				code: 201,
				name: "registered_partial",
				total: total,
				grps_registered: grps_registered
			}
		}
	},

	ERROR: {
		// @TODO implement
		// description: couldn't register user 'cause is already registered in all wa-groups
		USR_ALREADY_REGISTERED: {
			code: 406,
			name: "usr_already_registered"
		},
		// @TODO implement
		// description: couldn't found user. maybe it doesn't exits
		USR_NOT_FOUND: {
			code: 404,
			name: "usr_not_found"
		},
		// description: db got error at solve request
		DB_FAILED_REQUEST: {
			code: 502,
			name: "db_failed_request"
		},
		// @TODO implement
		// description: WhatsApp don't allow create more groups
		WA_FAILED_GRP_CREATION: {
			code: 503,
			name: "wa_failed_grp_creation"
		}
	}
}


router.get('/', (req, res) => {
	res.render('index', { title: 'SPVGA' });
});

router.get('/hola', (req, res) => {
	//let usu = res.form.usuario
	res.render('index', { title: 'Hola Gustavo' });
});

router.put("/signup", async (req, res) => {
	try {
		let grpRegistered = 0
		for (const classData of req.body.class) {
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
				// @TODO handle error on group creation
				.then(classRes => new Promise((resolve, reject) => {
						if (classRes)
							waGrpManager.getChatById(classRes._idwa)
								.then(resolve)
						else                                                                                                                    //  self-adding at group
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
												reject(RESCODE.ERROR.DB_FAILED_REQUEST)
											resolve(waChat)
										})
									}
								})
					})
				)
				.then(async waChat => {
					// @TODO handle error phoneId wasn't found
					let phoneId = await waGrpManager.getNumberId("521"+req.body.student.phone)

					let isParticipant = waChat.participants
						.some(participant => participant.id._serialized === phoneId._serialized)

					if (!isParticipant) {
						grpRegistered++;
						await waChat.addParticipants([phoneId._serialized])
					}
				})
		}
		let resStruct = grpRegistered===req.body.class.length
			? RESCODE.SUCCESS.REGISTERED_FULL
			: grpRegistered>=0
				? RESCODE.SUCCESS.REGISTERED_PARTIAL(req.body.class.length, grpRegistered)
				: RESCODE.ERROR.USR_ALREADY_REGISTERED

		res.status(resStruct.code)
			.type('application/json')
			.send(resStruct)

		//res.respondWith("Student Registered")
	}
	catch (err) {
		console.error(`SPVGA-ERROR: ${err}`)
		let resStruct = err=== RESCODE.ERROR.USR_ALREADY_REGISTERED
							? RESCODE.ERROR.USR_ALREADY_REGISTERED
						: err=== RESCODE.ERROR.USR_NOT_FOUND
							? RESCODE.ERROR.USR_NOT_FOUND
						: err=== RESCODE.ERROR.WA_FAILED_GRP_CREATION
							? RESCODE.ERROR.WA_FAILED_GRP_CREATION
						: err=== RESCODE.ERROR.DB_FAILED_REQUEST
							? RESCODE.ERROR.DB_FAILED_REQUEST
							: err
		res.status(resStruct.code?resStruct.code:500)
			.type('application/json')
			.send(resStruct)
	}
})

const abbreviate = (str, maxlength) =>
	str.length<=maxlength
		? str
		: str.split(" ")
			 .filter((w,i, strA) => w.length>4 || (i===0 || i===strA.length-1))
			 .map(w => w.substr(0,1))
			 .join("")
			 .substr(0,maxlength)

module.exports = router;
