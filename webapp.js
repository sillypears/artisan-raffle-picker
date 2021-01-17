'use strict';
const koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koaRouter = require('koa-router')
const serve = require('koa-static');
const fs = require('fs')
const Logger = require("koa-logger");

const xlsxFile = require('read-excel-file/node');

const { google } = require('googleapis');

const { env } = require('process');
const axios = require('axios');
require('dotenv').config();

const app = new koa()
const router = new koaRouter()

const PORT = 8080
let privatekey = require('./creds.json');
const { get } = require('http');


render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    // debug: true
})

async function getAuth() {
    const auth = await authenticate({
        keyfilePath: keyfile,
        scopes: [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/spreadsheets',
        ],
    });
    return auth
}

async function print(path) {
    const files = await fs.promises.readdir(path);
    return files
}

async function getJWT() {
    let jwt = new google.auth.JWT(
        privatekey.client_email,
        null,
        privatekey.private_key,
        ['https://www.googleapis.com/auth/drive']
    );
    jwt.authorize(function (err, tokens) {
        if (err) {
            console.log(`Failed to auth: ${err}`)
            return;
        }
    })
    return jwt
}
async function readExcel(filePath) {
    // console.log(filePath)
    const path = `./raffles/${filePath}`
    // console.log(path)
    return await xlsxFile(`./raffles/${filePath}`)
};

async function getSheets() {
    let jwtClient = await getJWT()
    var files;
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
            files = res.data.files;
            resolve(files)
        })
    })
}

async function getSheet(id) {
    let jwtClient = await getJWT()
    var data;
    let sheet = google.sheets('v4')
    return new Promise((resolve, reject) => {
        const dataA = sheet.spreadsheets.values.get({
            auth: jwtClient,
            spreadsheetId: id,
            range: 'A:D'
        }, (err, res) => {
            if (err){
                console.log(`Failed to get sheet: ${err}`)
                reject(`Error getting sheet: ${err}`)
                return;
            }
            data = res.data.values
            resolve(data)
        
        })
    })
}

router.get('/', async (ctx, next) => {
    const gdriveFiles = await getSheets()
    const raffleFiles = await print('./raffles/')
    return ctx.render('index', {
        raffles: raffleFiles,
        gdriveFiles: gdriveFiles
    });
});

router.get('/random/:max/:num?', async (ctx, next) => {
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
        console.log((res.data))
        ctx.body = {
            status: "success",
            random: Math.round(Math.random() * 100),
            message: res.data.result.random.data
        }
        return
    } else {
        console.log((res))
        ctx.body = {
            status: "failure",
            message: []
        }
        return
    }
})

router.get('/list', async (ctx, next) => {
    var listedData;
    var headers;
    if (ctx.query['raffle'] == 'file') {
        listedData = await readExcel(ctx.query.filename)
        headers = listedData.shift()
    } else if (ctx.query['raffle'] == 'gsheet') {
        listedData = await getSheet(ctx.query['filename'])
        headers = listedData.shift()
    }
    return ctx.render('list', {
        listItems: listedData,
        headerData: headers,
        randomSeed: listedData.length
    });
});

app.use(Logger())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve('./public'))

app.listen(PORT, () => console.log(`running on ${PORT}`))