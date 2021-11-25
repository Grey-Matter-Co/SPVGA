const MongoManager = require("../modules/db-managment")

MongoManager.addListener("connectionReady", () => {
	const classesColl = MongoManager.db("SPVGA").collection("classes")
	classesColl.deleteMany({}, function(err, res) {
		if (err || !res.acknowledged) throw err;

		console.log(JSON.stringify(res, null, 4));
		MongoManager.close();
	});
})
