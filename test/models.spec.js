var DB = require("better-sqlite3-helper")
DB({
    path: './test/database.sqlite',
    fileMustExist: true,
    migrate: false
})

const models = require('../models/models')
describe('Get Tests', () => {
    test('getRaffleId', () => {
        return models.getRaffleId("Test Raffle", "abcdefgh1234567890", false).then(data => {
            expect(data).toBe(1)
        })
    })

    test('getUserId', () => {
        return models.getUserId("testUser").then(data => {
            expect(data).toBe(1);
        })
    })

    test('getExistingRaffles', () => {
        return models.getExistingRaffles().then(data => {
            expect(data).toEqual([{ 'id': 1, 'title': 'Test Raffle', 'gsheetId': 'abcdefgh1234567890' }]);
        })
    })

    test('getRollsForRaffle', () => {
        return models.getRollsForRaffle(1).then(data => {
            expect(data).toBe(1)
        })
    })
    test('getRaffleWinner', () => {
        return models.getRaffleWinner(1).then(data => {
            expect(data).toEqual([{ 'username': 'testUser', 'platform': 'instagram' }])
        })

    })
    test('getDenyListUsers', () => {
        return models.getDenyListUsers().then(data => {
            expect(data).toEqual([{ 'id': 1, 'username': 'testUser', 'platform': 'instagram', 'date': 1613845553, 'reason': 'This is a test ban' }])
        })
    })
})