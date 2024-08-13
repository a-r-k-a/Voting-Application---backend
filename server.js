const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

//importing the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');

//bodyparser 
const bodyParser = require('body-parser');
app.use(bodyParser.json()) //req.body

const PORT = 6060;


//use the routers
app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);

app.listen(PORT, () => {
    console.log(`Listening to port: ${PORT}`);
})