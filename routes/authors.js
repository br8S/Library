const express = require('express');
const router = express.Router();
const Author = require('../models/author');
const Book = require('../models/book');

//All authors route 
router.get('/', async (req,res) => {
    let searchOptions = {} //variable stores all our search options that were sent
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
        res.redirect(`authors/${newAuthor.id}`)
    } catch{
        res.render('authors/new', { 
            author: author, 
            errorMessage: 'Error creating Author'
        })
    }   
}) 

router.get('/:id', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        const books = await Book.find({ author: author.id }).limit(6).exec() //these 6 books will be put into books variable
        res.render('authors/show', {
            author: author,
            booksByAuthor: books //recall this var has to be exactly same as var we created in show.ejs *note for showOptions same idea?
        })
    }
    catch{
        res.redirect('/')
    }
})

router.get('/:id/edit', async (req, res) => {
    try{
        const author = await Author.findById(req.params.id)
        res.render('authors/edit', { author: author })
    }
    catch{
        res.redirect('/authors')
    }
})

router.put('/:id', async (req, res) => {
    let author //we declare author outside try catch bc we need it in catch  so cant declare in scope of try
    try{
        author = await Author.findById(req.params.id) //uses mongoose db to get authoer by the id
        author.name = req.body.name //here we change name b4 save
        await author.save() //wait for author.save() to finish then going to populate newAuthor.. everything in mongodb is asynchronous
        res.redirect(`/authors/${author.id}`)
    } 
    catch{
        if(author == null){
            res.redirect('/');
        }
        else{
            res.render('authors/edit', { 
                author: author, 
                errorMessage: 'Error updating Author'
            })
        }
    }  
})

router.delete('/:id', async (req, res) => {
    let author //we declare author outside try catch bc we need it in catch  so cant declare in scope of try
    try{
        author = await Author.findById(req.params.id) //uses mongoose db to get authoer by the id
        await author.remove() 
        res.redirect('/authors')
    } 
    catch{
        if(author == null){
            res.redirect('/');
        }
        else{
            res.redirect(`/authors/${author.id}`) //using back ticks for string interpolation
        }
    }  
})


module.exports = router;