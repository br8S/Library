const express = require('express'); //ref express package we installed
const app = express(); //creating server
const expressLayouts = require('express-ejs-layouts'); //ref layout package we installed
const bodyParser = require('body-parser');

const mongoose = require('mongoose');

require("dotenv-flow").config();

//mongoose.connect(process.env.DBHOST, {useUnifiedTopology: true, useNewUrlParser: true }).catch(error => console/log("Error connecting to MongoDB" + error));

mongoose.connect
(
    process.env.DBHOST, //connection string is always the 1st parameter
    {
        useUnifiedTopology: true, //we need to provide some parameters top avoid errors from MongoDB
        useNewUrlParser: true
    }

).catch(error => console.log("Error connecting to MongoDB" + error));

mongoose.connection.once('open', () => console.log("Connected successfully to MongoDB"));

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');
const bookRouter = require('./routes/books');

app.set('view engine', 'ejs'); //state how views will be displayed.. we isntalled ejs
app.set('views', __dirname + '/views'); //setting where our views will be coming from.. in our case it will be in views folder
app.set('layout', 'layouts/layout'); //last we want to hook up express layouts
//every single file will be put in layout file so we dont have to duplicates
app.use(expressLayouts);
app.use(express.static('public')); //we want to tell express where our public files will be ie style, java, images, etc.
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false })) //order matters putting this under app.use('/authors', authorRouter); fucks everything

app.use('/', indexRouter);
app.use('/authors', authorRouter); //essentially everything will be preappended with authors/..
app.use('/books', bookRouter); 

const PORT = process.env.PORT || 3000; //if for some reason something goes wrong with .env then 4000

//start up server
app.listen(PORT, () => { //running at port 4000
    console.log("Server is running on port: " + PORT);
})

module.exports = app; //exporting our app as a module