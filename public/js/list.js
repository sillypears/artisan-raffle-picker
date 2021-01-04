$(function () {

    console.log("loaded")
});

var winners = 0;
var pickedNos = []

function rollIt(max) {
    var req = new XMLHttpRequest()
    req.open('GET', `/random/${max}`, true)
    req.onload = function () {
        let random = 1
        const data = JSON.parse(this.response)
        if (data.status == "success" ) {random = data.message[0]}
        if (pickedNos.indexOf(random) == -1) {
            pickedNos.push(random)
            winners += 1;
            alertOn = `#name-${random}`
            $('#index-' + random).addClass('highlight')
            $('#winners-list').append(`<div class="raffle-winner">${winners}. ${$(alertOn).text()}</div>`)
        } else {console.log(`${random} exists in ${pickedNos}`)}
    }
    req.send()

}