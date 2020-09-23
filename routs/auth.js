const express = require('express')
const router = require('express').Router()
const bcrypt = require('bcryptjs');
const User = require('../model/user')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const passport = require('passport')
const auth = require('./checkToken')
const Post = require('../model/post')
const GooglePlusTokenStrategy = require('passport-google-plus-token')
const { google } = require("googleapis")
const request = require("request")
const cors = require("cors")
const urlParse = require("url-parse")
const queryParse = require("query-string")
const axios = require("axios");
const sendmail = require('sendmail')();
const randomstring = require('randomstring');
const user = require('../model/user');
const multer = require('multer')



// const storageAvatar = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, './avatars/')
//     },
//     filename: function (req, file, cb) {
//         cb(null, Date.now() + file.originalname)
//     }
// })

// const fileFilter = (req, file, cb) => {
//     // reject a file
//     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
//         cb(null, true)
//     } else {
//         cb(null, false)
//     }

// }

// const uploadAvatar = multer({
//     storage: storageAvatar,
//     limits: {
//         fileSize: 1024 * 1024 * 5
//     },
//     fileFilter: fileFilter
// })

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'taskcord.co@gmail.com', // TODO: your gmail account
        pass: 'ShV44A2lih.ke44' // TODO: your gmail password
    },
    tls: {
        rejectUnauthorized: false
    }
});


// router.route('/google')
// .post(passport.authenticate('googleToken', {session: false}))




router.post('/signinGoogle', async (req, res) => {
    const emailExists = await User.findOne({ email: req.body.email })
    if (!emailExists) {
        res.status(400).send({ message: "Հարկավոր է գրանցվել" })
        return
    }

    const token = jwt.sign({ id: emailExists._id }, 'taskcord')
    res.send({ auth_token: token })
})




router.post('/signupGoogle', async (req, res) => {
    const googleMailExists = await User.findOne({ email: req.body.email })
    if (googleMailExists) {
        res.status(400).send({ message: "Էլ․ Հասցեն զբաղված է" })
        return
    }
    const googleUsernameExists = await User.findOne({ username: req.body.username })
    // if (googleUsernameExists) {
    //     res.status(400).send({ message: "Անունը զբաղված է" })
    //     return
    // }

    var defaultAvatars = [
        "https://www.iconfinder.com/data/icons/super-hero/154/batman-comics-hero-avatar-head-mask-512.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/ronin-young-hero-face-comics-avatar-256.png",
        "https://www.iconfinder.com/data/icons/super-hero/154/child-deadpool-face-mask-comics-hero-512.png",
        "https://www.iconfinder.com/data/icons/super-hero/154/death-mask-face-head-comics-skull-512.png",
        "https://www.iconfinder.com/data/icons/super-hero/154/woman-comics-hero-head-avatar-face-512.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/hulk-green-monster-head-avatar-comics-256.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/spider-man-spiderman-comics-hero-avatar-256.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/birdman-mask-hero-comics-avatar-256.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/black-panther-mask-hero-comics-avatar-256.png"
      ];
      
    var randomer = defaultAvatars[Math.floor(Math.random()*defaultAvatars.length)];


    var ids = await Post.find({userId: "5f4723b6d3c68e001708f1d1"}).select("title userId value")
    const user = new User({
        username: req.body.username,
        avatar: randomer,
        email: req.body.email,
        active: true,
        userScore: 30,
        doing: ids
    })


    try {
        const data = await user.save()
        await transporter.sendMail({
            to: req.body.email,
            from: 'shaliko.eghiazaryan@tumo.org',
            subject: 'Դուք գրանցված եք',
            text: "Hello",
            html: `<h1>Հարգելի ${req.body.username}, շնորհավորում ենք, դուք այսուհետ գրանցված եք Taskcord-ում։ Շնորհակալություն, միանալու համար և բարի ժամանց։</h1>`
        })
        res.send(data);
    } catch (error) {
        res.status(400).send({ message: "Փորձեք կրկին" })
        console.log(error);
    }


})

router.post('/signin', async (req, res) => {
    const emailExists = await User.findOne({ email: req.body.email })
    if (!emailExists) {
        res.status(400).send({ message: "Հարկավոր է գրանցվել" })
        return
    }
    const areSame = await bcrypt.compare(req.body.password, emailExists.password)
    if (!areSame) {
        res.status(400).send({ message: "Գաղտնաբառը սխալ է" })
        return
    }
    const activity = await User.findOne({ email: req.body.email, active: true })
    if (!activity) {
        res.status(400).send({ message: "Հարկավոր է հաստատել վավերացման կոդով, ստուգեք էլ․ հասցեն" })
        return
    }

    const token = jwt.sign({ id: emailExists._id }, 'taskcord')
    res.send({ auth_token: token })
})



router.post('/signup', /*uploadAvatar.single('avatar'),*/ async (req, res) => {
    const emailExists = await User.findOne({ email: req.body.email })
    if (emailExists) {
        res.status(400).send({ message: "Էլ․ Հասցեն զբաղված է" })
        return
    }
    const usernameExists = await User.findOne({ username: req.body.username })
    if (usernameExists) {
        res.status(400).send({ message: "Անունը զբաղված է" })
        return
    }
    var defaultAvatars = [
        "https://www.iconfinder.com/data/icons/super-hero/154/batman-comics-hero-avatar-head-mask-512.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/ronin-young-hero-face-comics-avatar-256.png",
        "https://www.iconfinder.com/data/icons/super-hero/154/child-deadpool-face-mask-comics-hero-512.png",
        "https://www.iconfinder.com/data/icons/super-hero/154/death-mask-face-head-comics-skull-512.png",
        "https://www.iconfinder.com/data/icons/super-hero/154/woman-comics-hero-head-avatar-face-512.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/hulk-green-monster-head-avatar-comics-256.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/spider-man-spiderman-comics-hero-avatar-256.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/birdman-mask-hero-comics-avatar-256.png",
        "https://cdn2.iconfinder.com/data/icons/super-hero/154/black-panther-mask-hero-comics-avatar-256.png"
      ];
      
    var randomer = defaultAvatars[Math.floor(Math.random()*defaultAvatars.length)];
    var ids = await Post.find({userId: "5f4723b6d3c68e001708f1d1"}).select("title userId value")
    const hashPassword = await bcrypt.hash(req.body.password, 10)
    // console.log(req.file);
    const user = new User({
        username: req.body.username,
        avatar: randomer,
        email: req.body.email,
        password: hashPassword,
        userScore: 30,
        doing: ids
    })

    //generate secret token
    const secretToken = randomstring.generate({
        length: 6,
        charset: 'numeric'
    })
    user.secretToken = secretToken
    user.active = false
    try {
        const data = await user.save()
        await transporter.sendMail({
            to: req.body.email,
            from: 'taskcord.co@gmail.com',
            subject: 'Վավերացման կոդ',
            html: `<h1>Վավերացման կոդ Taskcord-ից</h1><br><p>Հարգելի ${req.body.username}, Ահա վավերացման կոդը՝ <b>${user.secretToken}</b>  ... Տեղադրեք այն Վավերացման կոդի համար նախատեսված դաշտում գրանցումը հաստատելու համար։</p>`
        })
        res.send(data);
    } catch (error) {
        res.status(400).send({ message: "Փորձեք կրկին" })
        console.log(error);
    }


})

router.post('/verify', async (req, res) => {

    try {
        const { secretToken } = req.body
        const user = await User.findOne({ 'secretToken': secretToken })
        if (!user) {
            res.send({ message: 'Invalid code' })
            return
        } else {
            user.active = true
            await user.save()
            res.send({ message: 'success' })
        }
    } catch (error) {
        res.send(error)
    }
})

router.patch('/edit/:id', async (req, res) => {
    const hashPassword = await bcrypt.hash(req.body.password, 10)
    const id = req.params.id
    const username = req.body.username
    const avatar = req.body.avatar
    const password = hashPassword
    try {
        const data = await User.findOneAndUpdate({ _id: id }, { $set: { username: username, avatar: avatar, password: password } })
        res.send(data)
    } catch (error) {
        res.send({ message: 'Ինչ որ բան սխալ է' })
    }
})


router.patch('/editWithouPass/:id', async (req, res) => {
    const id = req.params.id
    const username = req.body.username
    const avatar = req.body.avatar
    try {
        const data = await User.findOneAndUpdate({ _id: id }, { $set: { username: username, avatar: avatar} })
        res.send(data)
    } catch (error) {
        res.send({ message: 'Ինչ որ բան սխալ է' })
    }
})

router.patch('/changeScore/:id', async (req, res) => {
    const id = req.params.id
    const userScore = req.body.userScore
    try {
        const data = await User.findOneAndUpdate({ _id: id }, { $set: { userScore: userScore } })
        res.send(data)
    } catch (error) {
        res.send({ message: 'Ինչ որ բան սխալ է' })
        
       console.log(error);
    }
})




// router.patch('/changeDoing/:id', async (req, res) => {
//     const id = req.params.id
//     const doing = req.body.doing
//     try {
//         const data = await User.findOneAndUpdate({ _id: id }, { $set: { doing: doing } })
//         res.send(data)
//     } catch (error) {
//         res.send({ message: 'Something went wrong' })
//         console.log(error);
//     }
// })

router.patch('/changeDoing/:id', async (req, res) => { 
    const id = req.params.id 
    const doing = req.body.doing
    try {
        const data = await User.findOneAndUpdate({ _id: id }, { $set: { doing: doing } }) 
        res.send(data)
    } catch (error) {
        res.send({ message: 'Ինչ որ բան սխալ է' })
        console.log(error);
    }
})

// router.patch('/changeValue/:id/:id2', async (req, res) => {
//     const id = req.params.id
//     const id2 = req.params.id2
//     const value = req.body.value
//     // const a = await User.findOne({_id: id})
//     try {
//         const data = await User.findOneAndUpdate({ _id: id,  doing:{_id: id2}}, { $set: { doing:{value: value}}}) 
//         // var data = a.doing.find(obj => obj._id === id2);
//         res.send(data)
//     } catch (error) {
//         res.send({ message: 'Something went wrong' })
//         console.log(error);
//     }
// })


router.get('/profile', auth, async (req, res) => {
    try {
        const profile = await User.findById(req.user)
        res.send(profile)

    } catch (error) {
        console.log(error);
        res.status(400).send({ message: 'Ինչ որ բան սխալ է' })
    }
})

router.get('/leaderboard', async (req, res) => {
    try {
        let points = await User.find({ active: true }).select('userScore date username avatar email doing').sort('userScore')
        res.send(points)
    } catch (error) {
        res.send({ message: 'Ինչ որ բան սխալ է' })
        console.log(error);
    }
})


router.delete('/notActive', async (req, res) => {
    try {
        const data = await User.deleteMany({active: false})
        // const data = Post.findOneAndDelete({title:""})
        res.send(data)

    } catch (error) {
        res.send({ message: 'Ինչ որ բան սխալ է' })
        console.log(error);
    }
})

module.exports = router