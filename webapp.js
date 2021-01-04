'use strict';
const koa = require('koa')
const path = require('path')
const render = require('koa-ejs')
const koaRouter = require('koa-router')
const serve = require('koa-static');
const fs = require('fs')
const Logger = require("koa-logger");
const xlsxFile = require('read-excel-file/node');
const { env } = require('process');
const rpc = require('node-json-rpc')
const axios = require('axios')
require('dotenv').config()

const app = new koa()
const router = new koaRouter()

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];



render(app, {
    root: path.join(__dirname, 'views'),
    layout: 'template',
    viewExt: 'html',
    cache: false,
    // debug: true
})
async function print(path) {
    const files = await fs.promises.readdir(path);
    return files
}

async function readExcel(filePath) {
    // console.log(filePath)
    const path = `./raffles/${filePath}`
    // console.log(path)
    return await xlsxFile(`./raffles/${filePath}`)
};

// async function getRandom(max) {
//     const options = {
//         port: 443,
//         host: "api.random.org",
//         path: "/json-rpc/1/invoke",
//         strict: true
//     }
//     var client = new rpc.Client(options);

//     console.log(process.env.RANDOM_ORG_API)
//     client.call(
//         {
//             "jsonrpc": "2.0",
//             "method": "generateIntegers",
//             "params": {
//                 "apiKey": process.env.RANDOM_ORG_API,
//                 "n": 1,
//                 "min": 1,
//                 "max": max,
//                 "replacement": true
//             },
//             "id": 1
//         },
//         function (err, res) {
//             if (err) { console.log("bad " + err); }
//             else { console.log("good " + res) }
//         })
// };

router.get('/', async (ctx, next) => {
    const raffleFiles = await print('./raffles/')
    return ctx.render('index', {
        raffles: raffleFiles,
    });
});

router.get('/random/:max/:num?', async (ctx, next) => {
    if (ctx.params.max == 1) {
        ctx.body = {
            status: "success",
            message: [1]
        }
        return
    }
    const options = {
        port: 443,
        host: "api.random.org",
        path: "json-rpc/2/invoke",
        strict: true
    }
    let n = 1
    console.log(`ctx.params.max: ${ctx.params.max}`)
    if (ctx.params.num) {
        n = ctx.params.num
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
    const listedData = await readExcel(ctx.query.filename)
    listedData.shift()
    return ctx.render('list', {
        listItems: listedData,
        randomSeed: listedData.length
    });
});



app.use(Logger())
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve('./public'))



app.listen(8080, () => console.log('running'))