const { expect } = require('chai');
const { test } = require('mocha');
var connectDB = require('../config/db');
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

connectDB = async() => {
    try {
        await mongoose.connect(db, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.log(err.message);

    }
};

connectDB();


test("New_Database_replace_old_Datebase", async function() {
    const longUrl = 'https://www.dcard.tw/f/relationship/p/238527570';
    const baseUrl = config.get('baseUrl');
    const afterurl = require('shortid').generate();
    const Url = require('../models/Url');
    const shortUrl = baseUrl + '/' + afterurl;

    url = new Url({
        afterurl,
        longUrl,
        shortUrl
    });
    await
    url.save();

    expect(url.longUrl).equal(longUrl);
    expect(url.shortUrl).to.equal(shortUrl);
    expect(url.afterurl).to.equal(afterurl);
});