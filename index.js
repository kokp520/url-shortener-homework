const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const Url = require('./models/Url');
const shortid = require('shortid');
const app = express();

connectDB();

app.use(express.json());

app.set('view engine', 'ejs');
app.get('/', async(req, res) => {
    const backurl = await Url.find();
    res.render('view', { backurl: backurl })
})

app.use(express.urlencoded({ extended: false }))


const PORT = 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const config = require('config');

app.post('/', async(req, res) => {
    const baseUrl = config.get('baseUrl');
    const afterurl = shortid.generate();
    const longUrl = (req.body.longurl);
    const validUrl = require('valid-url');

    if (validUrl.isUri(longUrl)) {
        try {
            let url = await Url.findOne({ longUrl });

            const shortUrl = baseUrl + '/' + afterurl;
            url = new Url({
                afterurl,
                longUrl,
                shortUrl,
                date: new Date()
            });
            await
            url.save();

        } catch (err) {
            console.error(err);
            res.status(404).json('url not found');
        }
        return res.redirect('/');
    } else {
        res.status(404).json('Invalid url');
    }
});

app.get('/:afterurl', async(req, res) => {
    try {
        const back = await Url.findOne({ afterurl: req.params['afterurl'] });

        if (back.afterurl == null) {
            return res.status(404).json('url not found');
        } else {
            return res.redirect(back.longUrl);
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json('Server error');
    }
});