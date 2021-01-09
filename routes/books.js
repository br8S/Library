const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Book = require('../models/book');
const Author = require('../models/author');
const uploadPath = path.join('public', Book.coverImageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, imageMimeTypes.includes(file.mimetype))
//     }
// })

//All books route 
router.get('/', async (req,res) => {
    let query = Book.find(); //getting all books without actually searching for one.. returns a query object which we can build a query from and execute later
    if(req.query.title != null && req.query.title != ''){ //checks if we have a valid title first.. so we can check and render query inside the query
        query = query.regex('title', new RegExp(req.query.title, 'i')); //this is just appending to our query
    } //'title' is our db model parameter.. book.title
    //RegExp contains the title and i flag for case insensitive

    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){ //checks if we have a valid date first.. so we can check and render query inside the query
        query = query.lte('publishDate', req.query.publishedBefore); //lte = less than or equal
    } //if the publish date of book is before the date we are searching for we want to return that obj.. ie req.query.publishedBefore

    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){ //checks if we have a valid date first.. so we can check and render query inside the query
        query = query.gte('publishDate', req.query.publishedAfter); //lte = greater than or equal
    } 

//wrapped in a try catch bc we are using asynchronous code
    try{
        const books = await query.exec() //this returns all books in our db.. await is very important so we give time to search
        //query.exec executes query that we defined above 
        res.render('books/index', {
            books: books, //lists of all our books we are going to create
            searchOptions: req.query //users search parameters.. recall query is the part of the url that asks for stuffs
        })
    }
    catch{
        res.redirect('/') //upon an error we would like to redir to home page
    }
})

//New book route
router.get('/new', async (req,res) => {
    renderNewPage(res, new Book());
}) 

// Create book route
router.post('/', async (req,res) => { // using '/' bc we are posting to the entire collection
    //const fileName = req.file != null ? req.file.filename : null //req.file is file we are uploading to server.. essentially we are just getting file name from file if it exists
    const book = new Book({ //we want to create a book obj and populate it using the parameters entered in the form
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        //coverImageName: fileName,
        description: req.body.description
    }) 

    saveCover(book, req.body.cover) //encoded json cover is stored in req.body.cover

    try{
        const newBook = await book.save();
        res.redirect('books');
    }
    catch{
        // if (book.coverImageName !== null){
        //     removeBookCover(book.coverImageName); //we only want to call this if we actually have a cover image name.. bc if there is no name there is no image to remove
        // }
        renderNewPage(res, book, true);
    }
}) 

// function removeBookCover(fileName){
//     fs.unlink(path.join(uploadPath, fileName), err => { //this will get rid of any file in /public/uploads
//         if (err) console.error(err) //this error is insignificant to the user.. just for us
//     })
// }

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({}); //first we want to find all the authors
        const params = {
            authors: authors, //passing authors we created and book 
            book: book
        }
        if (hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params )
    }
    catch{
        res.redirect('/books') //if there is any errors we just want it to render /books page
    }
}

function saveCover (book, coverEncoded){ //we want to check our cover is valid and if so save it to book.cover
    if(coverEncoded == null) return //no good
    const cover = JSON.parse(coverEncoded); //we want cover unencoded.. coverEncoded is just a string that is json  
    if(cover != null && imageMimeTypes.includes(cover.type)){ //making sure image is correct format ie png jpg
        book.coverImage = new Buffer.from(cover.data, 'base64'); //allows us to create a buffer from some set of data
        book.coverImageType = cover.type;
    }
}

module.exports = router;