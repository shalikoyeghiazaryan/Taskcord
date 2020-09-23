const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        max: 250,
        min: 2,
        required: true
    },
    textArea: {
        type: String,
        max: 1000,
        min: 2,
        required: true
    },
    level: {
        type: Number,
        max: 10,
        min: 1
    },
    astxik: {
        type: Number,
        max: 3,
        min: 0,
    },
    imgUrl: {
        type: String,
        max: 100,
        min: 2,
    },
    imgLogo: {
        type: String,
        max: 100,
        min: 1,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    help:{
        type: String
    },
    questKey: {
        type: String
    },
    value:{
        type: Number,
        default: 1
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('post', postSchema)