require('dotenv').config();
const collectionManager = require("../modules/db-managment")

collectionManager.addListener("connectionReady", () => {
	const classesColl = collectionManager.db("SPVGA").collection("classes")
	classesColl.deleteMany({}, function(err, res) {
		if (err || !res.acknowledged) throw err;

		console.log(JSON.stringify(res, null, 4));
		collectionManager.close();
	});
})
