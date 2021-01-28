const sqlite3 = require('sqlite3').verbose()

let db = new sqlite3.Database('./database/database.sqlite', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Connected to the db`)
})

db.query = function(sql, params) {
    var that = this;
    return new Promise(function(resolve, reject) {
        that.all(sql, params, function(error, rows) {
            if (error)
                reject(error);
            else
                resolve({ rows: rows });
        });
    });
};

db.getone = function(query, params) {

    return new Promise(function(resolve, reject) {
        db.get(query, params, function(err, row) {
            if (err) reject("Read error: " + err.message)
            else {
                resolve(row)
            }
        })
    })
}

module.exports = db