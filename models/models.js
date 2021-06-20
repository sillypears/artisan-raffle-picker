var DB = require("better-sqlite3-helper")
require('arraync')

async function getRaffleId(title, gsheetId, create) {
    let row = await DB().queryFirstRow('SELECT id FROM raffles WHERE title=?', title);
    if (create) { return row ? row.id : createRaffleId(title, gsheetId) }
    return row ? row.id : -1
}

async function createRaffleId(title, gsheetId) {
    const lastID = await DB().insert('raffles', {
        title: title,
        date: Math.floor(new Date().getTime() / 1000),
        gsheetId: gsheetId
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

async function addRolls(winnerId, raffleId) {
    let rollIds = await DB().insert('rolls', {
        date: Math.floor(new Date().getTime() / 1000),
        raffleId: raffleId,
        userId: winnerId
    })
    return [rollIds]
}

async function getRaffleFromDB(raffleId) {
    let rowGsheet = await DB().queryFirstRow('SELECT gsheetId FROM raffles WHERE id=?', raffleId)
    if (!rowGsheet) {
        return { raffleId: -1, winners: [] }
    }
    const rowWinners = await DB().query('SELECT u.username, u.email FROM rolls r LEFT JOIN users u ON u.id = r.userId WHERE r.raffleId=?', raffleId)
    return rowWinners
}

async function saveWinners(data) {
    let title = data.title
    let winners = data.data.winners
    let emails = data.data.emails
    let id = data.data.gsheetId
    let raffleID = await getRaffleId(title, id, true)
    let winnerIds = [];
    let rollIds = [];
    await winners.forEachAsync(async function(name, index) {
        let winnerId = await getUserId(name, emails[index], (data) => { return data })
        rollIds.push(await addRolls(winnerId, raffleID))
        winnerIds.push(winnerId)

    })
    console.log(`rid: ${raffleID} uid: ${winnerIds} rolls: ${rollIds}`)

    return raffleID ? raffleID : -1
}

async function getExistingRaffles() {
    let rows = await DB().query('SELECT id, title, gsheetId FROM raffles ')
    return rows
}

async function removeRaffle(raffleId) {
    let rowRoll = await DB().delete('rolls', { raffleId: raffleId })
    let rowRaffle = await DB().delete('raffles', { id: raffleId })
    console.log(`${rowRoll} ${rowRaffle}`)
}

async function getRollsForRaffle(raffleId) {
    const row = await DB().query('SELECT count(r.id) as count FROM rolls r WHERE r.raffleId = ?', raffleId)
    return row[0]['count']
}
async function getDenyListUsers() {

    let row = await DB().query('SELECT u.id, u.username, u.platform, d.date, d.reason FROM denylist d LEFT JOIN users u ON d.userId = u.id')
    return row
}

async function getRaffleWinner(raffleId) {
    let rows = await DB().query("SELECT u.username, u.platform FROM rolls r LEFT JOIN users u ON u.id = r.userId")
    return rows
}
async function getRaffleWinners() {
    let raffleNames = await DB().query("SELECT DISTINCT(r.title) FROM rolls ro LEFT JOIN raffles r ON ro.raffleId = r.id")
    let raffles = {}
    await raffleNames.forEachAsync(async function(name) {
        raffles[name.title] = []
    })
    let rows = await DB().query('SELECT * FROM raffle_winners')
    await rows.forEachAsync(async function(row) {
        raffles[row.title].push({ username: row.username, platform: row.platform })
    })
    return raffles
}
async function getUsers() {
    let users = await DB().query("SELECT u.id, u.username, u.platform, count(r.id) as wins FROM users u LEFT JOIN rolls r ON r.userId = u.id")
    return users
}
module.exports = {
    saveWinners,
    getRaffleId,
    getUserId,
    getRaffleFromDB,
    getExistingRaffles,
    removeRaffle,
    getDenyListUsers,
    getRollsForRaffle,
    getRaffleWinner,
    getRaffleWinners,
    getUsers
}