const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function(next){
    Book.find({ author: this.id }, (err, books) => {
        if(err){ //only happen if mongoose doesnt connect to db
            next(err)
        }
        else if (books.length > 0){ //if there are books
            next(new Error('This author still has books'))
        } 
        else{ //tells mongoose its ok to remove author
            next()
        }
    })
})

module.exports = mongoose.model('Author', authorSchema);