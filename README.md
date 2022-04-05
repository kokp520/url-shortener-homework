# Dcard - Url shortener

Url shortener created by Nodejs ,MongoDB

# 前言

在先前的實習經驗中，為了優化公司內部的營運狀況，解決總部對於公司上的營運流程，利用python做了一個小小的project，可以簡化維修技師的施工流程，此事件之後引發我對於軟體學習的熱誠，以致在網路上搜尋有關軟體工程師的內容，看到Dcard後端實習生的面試機會，且實習中會有Mentor實際教導，並對此職位產生濃厚興趣，想藉由此次機會提升自己的Back-end能力。

無論結果如何，都還是感謝Dcard給我一個目標去實作一個project!! :smile: 

# How to work

* Have to use npm install
* /config/default.json
```
{
    "mongoURI": "",
    "baseUrl": "http://localhost:5001"
}
```

1. Edit the "mongoURL" in default.json
2. start server and connect  mongodatabase
3. paste URL to baseurl 

# 設計流程

## 1. Client POST URL
* 利用ejs來開啟較直觀的輸入方式
* views/view.ejs
```

app.set('view engine', 'ejs');
app.get('/', async(req, res) => {
    const backurl = await Url.find();
    res.render('view', { backurl: backurl })
})

```
---
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Url shortener</title>
</head>
<body>
<div text-align="center">
        <h1>短網址產生器</h1>
        <form action="/" method="POST">
        <input required plcaeholder="網址" type="url" name="longurl">
        <button>輸入</button>
        </form>
        <br/>
        <br/>
        <tr><td>短網址:</tr></td>
        <table>
        <% backurl.forEach(Url => { %><tr>
        <td><a href="<%= Url.shortUrl %>"><%= Url.shortUrl %></a</td></tr>
        <% })%>
        </table>
</div>
</body>
</html>
```
## 2. 開啟server以及連結mongoDB

 * 原因：方便儲存管理以及有效的修改內容
 * /models/Url.js 
 ---

 ```
const mongoose = require('mongoose');
const urlSchema = new mongoose.Schema({

    afterurl: String,
    longUrl: String,
    shortUrl: String,
    date: { type: String, default: Date.now }
});

module.exports = mongoose.model('Url', urlSchema);
```
---
 * server
 * index.js

 ---
```
const express = require('express');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const app = express();

connectDB();

const PORT = 5001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```
---
 * 連接database
 * /config/db.js
---
``` 
const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async() => {
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

module.exports = connectDB;
```
---
## 3. 轉換成shorturl

```
const config = require('config');

app.post('/', async(req, res) => {
    const baseUrl = config.get('baseUrl');
    const afterurl = shortid.generate();
    const longUrl = (req.body.longurl);
    const validUrl = require('valid-url');
        //確認是否為有效網址
    if (validUrl.isUri(longUrl)) {
        try {
            //找到相對應Url
            let url = await Url.findOne({ longUrl });
            
            const shortUrl = baseUrl + '/' + afterurl;
            //取代原Url資料庫
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
```


## 4. 導向回原Url


```

app.get('/:afterurl', async(req, res) => {
    try {
        const back = await Url.findOne({ 
        
        afterurl:req.params['afterurl'] });
        
        //確認隨機生成Code是否存在
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
```

## 單元測試
* 沒有時間了只來得及做這個測試...

```

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
```

## 效能優化
此次來不及學習且考慮性能部分，不過有google到可行的實作方法，可以使用Redis。
可以直接存儲在Redis內，並直接redirect到相對的URL。

 # 結論
 * 可優化內容
             1.隔離需要測試的Code,再實行單元測試的時候因為資料庫以及檔案都在同一個檔案，導致測試困難，速度上也會變慢，應遵循範圍小、快速、獨立之作法。
             2.變數的命名應更嚴謹，以免造成降低可讀性的後果。
             3.單元測試還可以分得更細「導向原網址」、「有效驗證」「GET、POST的API測試」等。
             
             
* 寫到中期的時候才開啟把有發生過錯誤的部分筆記下來，增加有疑慮部分的印象，前面有部分錯誤沒有被記下來，而是直接google找到解決辦法，有點可惜，關於PRNG的部分也可以研究一下shortid背後原理，對於之前無相關經驗的我來說要完成一個project也是蠻吃力的，同時也很開心可以了解到相關語法、資料結構、資料庫等內容。 

* 再次感謝Dcard by Jim Wu










