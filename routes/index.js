let express = require('express');
let router = express.Router();
let waGrpManager = require('../modules/wagroups-manager');
let dbManager = require('../modules/db-managment')

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
		phone = `521${req.body.phone}`,
		email   = req.body.email,
		inscription = req.body.inscription;
	
	waGrpManager.getNumberId(phone)
		.then(phoneid => waGrpManager
			.createGroup("testGroup", [waGrpManager.info.wid._serialized, phoneid._serialized]))
		.then((createRes) => {
			console.log(`SPVGA: gid= ${createRes.gid}`)
			res.sendStatus(200)
		})
		.catch( reason => console.error("SPVGA: ", reason))
	
	
})

module.exports = router;
