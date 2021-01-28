const DB = require("sqlite3-helper")
require('arraync')

async function getRaffleId(title, create) {
    let row = await DB().queryFirstRow('SELECT id FROM raffles WHERE title=?', title);
    if (!create) { return row ? row.id : -1 }
    return row ? row.id : createRaffleId(title)
}

async function createRaffleId(title) {
    const lastID = await DB().insert('raffles', {
        title: title,
        date: Math.floor(new Date().getTime() / 1000)
    });
    return lastID
}

async function getUserId(name, email) {
    let row = await DB().queryFirstRow('SELECT id FROM users WHERE username=?', name)
    return row ? row.id : createUser(name, email)
}

async function createUser(name, email) {
    const platform = (name.includes('#')) ? 'discord' : 'instagram'
    const lastID = await DB().insert('users', {
        username: name,
        email: email,
        platform: platform
    })
    return lastID
}

async function addRolls(rolls) {

}

async function saveWinners(data) {
    let title = data.title
    let winners = data.data.winners
    let emails = data.data.emails
    let raffleID = await getRaffleId(title, true)
    let winnerIds = [];
    await winners.forEachAsync(async function(name, index) {
        winnerIds.push(await getUserId(name, emails[index], (data) => { return data }))
    })
    console.log(`rid: ${raffleID} uid: ${JSON.stringify(winnerIds)}`)
    return raffleID ? raffleID : -1
}

module.exports = {
    saveWinners,
    getRaffleId
}