const { MongoClient } = require('mongodb');

const user     = process.env.DB_USER
const psswd    = process.env.DB_PSSWD
const dbName   = process.env.DB_NAME
const collName = "classes"

const uri = `mongodb+srv://${user}:${psswd}@thecluster.hdtwxee.mongodb.net/${dbName}?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
	if (err) throw err;
	console.log("MongoDB: Connected")
});

module.exports = client