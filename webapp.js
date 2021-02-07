'use strict';
const { env } = require('process');
require('dotenv').config();

const koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koaRouter = require('koa-router')
var bodyParser = require('koa-body')
const serve = require('koa-static');
const fs = require('fs')
const Logger = require("koa-logger");
const favicon = require("koa-favicon")

// For google related stuff
const { google } = require('googleapis');
const axios = require('axios');

var DB = require("better-sqlite3-helper")
DB({
    path: './database/database.sqlite',
    fileMustExist: true,
    migrate: false
})
var models = require('./models/models')


const app = new koa()
app.use(bodyParser())
app.use(favicon(__dirname + '/public/favicon.ico'));
const router = new koaRouter()

const PORT = 8080
let privatekey = require('./creds.json');

render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    // debug: true
})

async function getJWT() {
    let jwt = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key, ['https://www.googleapis.com/auth/drive']
    );
    jwt.authorize(function(err, tokens) {
        if (err) {
            console.log(`Failed to auth: ${err}`)
            return;
        }
    })
    return jwt
}

async function getSheets() {
    let jwtClient = await getJWT()
    let drive = google.drive('v3');
    return new Promise((resolve, reject) => {
        const filesA = drive.files.list({
            auth: jwtClient,
            q: "mimeType = 'application/vnd.google-apps.spreadsheet' and (name contains 'Raffle' or name contains 'raffle')"
        }, (err, res) => {
            if (err) {
                console.log(`Failed to get drive: ${err}`);
                reject(`Error getting files: ${err}`)
                return;
            }
            resolve(res.data.files)
        })
    })
}

async function getSheet(id) {
    let jwtClient = await getJWT()
    var data;
    let sheet = google.sheets('v4')
    return new Promise((resolve, reject) => {
        let title = ''
        const titleA = sheet.spreadsheets.get({
            auth: jwtClient,
            spreadsheetId: id
        }, (err, res) => {
            if (err) {
                console.log(`Failed to get sheet title: ${err}`)
                reject(`Failed to get sheet title: ${err}`)
                return;
            }
            title = res.data.properties.title
            const dataA = sheet.spreadsheets.values.get({
                auth: jwtClient,
                spreadsheetId: id,
                range: 'A:D'
            }, (err, res) => {
                if (err) {
                    console.log(`Failed to get sheet values: ${err}`)
                    reject(`Error getting sheet values: ${err}`)
                    return;
                }

                data = { 'title': title, 'data': res.data.values }
                data = resolve(data)

            })
        })
    })
}

router.get('/', async(ctx, next) => {
    const gdriveFiles = await getSheets()
    return ctx.render('index', {
        title: "Artisan Raffle Winner Picker!",
        gdriveFiles: gdriveFiles
    });
});

router.get('/random/:max/:num?', async(ctx, next) => {
    // random.org requires a min/max so just return 1 and exit
    if (ctx.params.max < 1) {
        ctx.body = {
            status: "failure",
            message: []
        }
        return
    }
    if (ctx.params.max == 1) {
        ctx.body = {
            status: "success",
            random: Math.round(Math.random() * 100),
            message: [1]
        }
        return
    }

    // default to picking 1 number unless specified
    let n = 1
    if (ctx.params.num) {
        n = ctx.params.num
    }

    const options = {
        port: 443,
        host: "api.random.org",
        path: "json-rpc/2/invoke",
        strict: true
    }

    const data = JSON.stringify({
        "jsonrpc": "2.0",
        "method": "generateIntegers",
        "params": {
            "apiKey": process.env.RANDOM_ORG_API,
            "n": n,
            "min": 1,
            "max": ctx.params.max,
            "replacement": true
        },
        "id": 1
    })
    const config = {
        method: "POST",
        url: `https://${options.host}/${options.path}`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    }
    let res = await axios(config)
    if (res.status === 200) {
        ctx.body = {
            status: "success",
            random: Math.round(Math.random() * 100),
            message: res.data.result.random.data
        }
        return
    } else {
        ctx.body = {
            status: "failure",
            message: []
        }
        return
    }
})

router.get('/list', async(ctx, next) => {
    let listedTitle;
    let listedData;
    let headers;
    let winners = [];
    listedData = await getSheet(ctx.query['filename'])
    listedTitle = listedData['title']
    let foundRaffle = await models.getRaffleId(listedTitle, false)
    let foundRolls = await models.getRollsForRaffle(foundRaffle)
    listedData = listedData['data']
    headers = listedData.shift()
    if (foundRaffle > 0 && foundRolls > 0) {
        winners = await models.getRaffleFromDB(foundRaffle)
        return ctx.render('relist', {
            title: `Listing Raffle`,
            listTitle: listedTitle,
            listItems: listedData,
            gsheetId: ctx.query['filename'],
            winners: winners,
            headerData: headers,
            randomSeed: listedData.length
        });
    } else {
        return ctx.render('list', {
            title: `Listing Raffle`,
            listTitle: listedTitle,
            listItems: listedData,
            gsheetId: ctx.query['filename'],
            winners: winners,
            headerData: headers,
            randomSeed: listedData.length
        });
    }
});

router.post('/savewinners', async(ctx, next) => {
    if (!ctx.request.body.title || !ctx.request.body.data) {
        ctx.response.status = 400;
        ctx.body = {
            status: 'failure',
            message: "Title/data not found"
        }
    } else {
        console.log(ctx.request.body)
        let info = await models.saveWinners(ctx.request.body)
        if (info) {
            ctx.response.status = 201
            ctx.body = {
                status: 'success',
                message: info
            }
        } else {
            ctx.response.status = 400
            ctx.body = {
                status: 'failure',
                message: 'DB failure'
            }
        }
    }
    return;
});

router.get('/raffles', async(ctx, next) => {
    let raffles = await models.getRaffleWinners()
    return ctx.render('raffles', {
        title: 'Raffles',
        raffles: raffles
    })
})
router.get('/remove', async(ctx, next) => {
    console.log(ctx.query.raffleId)
    if (ctx.query.raffleId) {
        console.log(await models.removeRaffle(ctx.query.raffleId))
    }
    let raffles = await models.getExistingRaffles()

    return ctx.render('remove', {
        title: "Delete Raffle?",
        raffles: raffles
    })
})

router.get('/denylist', async(ctx, next) => {
    let denylist = await models.getDenyListUsers()
    return ctx.render('deny', {
        title: "Naughty People",
        denied: denylist
    })
})

app.use(Logger())
    .use(router.routes())

.use(router.allowedMethods())
    .use(serve('./public'))

app.listen(PORT, () => console.log(`running on ${PORT}`))