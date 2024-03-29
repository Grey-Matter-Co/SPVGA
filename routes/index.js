const express = require('express');
const router = express.Router();
const WhatsappHandler = require('../modules/WhatsappHandler');
const WhatsappClient = require('../modules/WhatsappClient');
const dbManager = require('../modules/db-managment')
const classesColl = dbManager.db(process.env.DB_NAME).collection("classes")
const RESCODE = {
	SUCCESS: {
		// description: student was registered in all wa-groups
		REGISTERED_FULL: {
			code: 200,
			name: "registered_full"
		},
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
		// description: couldn't register user 'cause is already registered in all wa-groups
		USR_ALREADY_REGISTERED: {
			code: 406,
			name: "usr_already_registered"
		},
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
		// description: WhatsApp don't allow create more groups
		WA_FAILED_GRP_CREATION: {
			code: 503,
			name: "wa_failed_grp_creation"
		}
	}
}

const waHandler = new WhatsappHandler();
const waClient = new WhatsappClient(waHandler, true);


router.get('/', (req, res) => {
	res.render('index', { title: 'SPVGA' });
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
				teacher:    classData.teacher,
				schedule:   classData.schedule,
				name:       classData.name,
			}

			await classesColl.findOne(query, {projection: {_id: 1, _idwa: 1}})
				.then(classRes => new Promise((resolve, reject) => {
						if (classRes)
							waClient.getChatById(classRes._idwa)
								.then(resolve)
						else
							waClient.createSchoolarGroup(query.name, classData.teacher, classData.schedule ,`${query.group}-${abbreviate(query.name, 25-query.group.length-1)}`, [waClient.info.wid._serialized], )
								.then(waChat => {
									query._idwa = waChat.id._serialized
									classesColl.insertOne(query, error => {
										if (error)
											reject(RESCODE.ERROR.DB_FAILED_REQUEST)
										resolve(waChat)
									})
								})
							            
					})
				)
				.then(async waChat => {
					
					let phoneId = await waClient.validateContact("521"+req.body.student.phone)
					
					if (!phoneId)
						return Promise.reject(RESCODE.ERROR.USR_NOT_FOUND)
					else {
						let isParticipant = waChat.participants
							.some(participant => participant.id._serialized === phoneId._serialized)
	
						if (!isParticipant) {
							grpRegistered++;
							await waChat.addParticipants([phoneId._serialized])
						}
					}

				})
		}
		let resStruct = grpRegistered===req.body.class.length
			? RESCODE.SUCCESS.REGISTERED_FULL
			: grpRegistered>0
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
