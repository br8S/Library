const express = require('express');
const router = express.Router();
const Author = require('../models/author');

//All authors route 
router.get('/', async (req,res) => {
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== ''){ //here we are adding search functionality
        searchOptions.name = new RegExp(req.query.name, 'i') //i flag means case insensitive
    }
    try{
        const authors = await Author.find(searchOptions) //we want to get all authors.. Author model has tons of functionality.. in our case we just want to find.. no parameters bc we want all of them  
        res.render('authors/index', {   
            authors: authors,   
            searchOptions: req.query 
        });
    } catch{
        res.redirect('/');
    }
})

//New author route
router.get('/new', (req,res) => {
    res.render('authors/new', { author: new Author() }) //this is the name of the ejs file we want in to render.. each req had a diff file
}) 

// Create author route
router.post('/', async (req,res) => { // using '/' bc we are posting to the entire collection
    const author = new Author ({ name: req.body.name }) //here we specify what we want bc we dont want the client to send us useless shit
    try{
        const newAuthor = await author.save(); //wait for author.save() to finish then going to populate newAuthor.. everything in mongodb is asynchronous
        //res.redirect('authors/${newAuthor.id}')
        res.redirect('authors');
    } catch{
        res.render('authors/new', { 
            author: author, 
            errorMessage: 'Error creating Author'
        })
    }   
}) 

module.exports = router;