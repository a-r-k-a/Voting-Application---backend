const mongoose = require('mongoose');
require('dotenv').config();

//define the mongodb connection url
const mongoURL = process.env.MONGODB_URL_LOCAL

//setup the mongodb connection
mongoose.connect(mongoURL);

//get the default connection
const db = mongoose.connection;

//define event listeners on database connections
db.on('connected', () => {
    console.log("Connected to MongoDb server");
});
db.on('error',(err) => {
    console.log("Error connecting MongoDb", err);
});
db.on('disconnected', () => {
    console.log("MongoDb server disconnected");
})

//export the database connections
module.exports = db;