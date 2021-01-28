$(function() {

    console.log("loaded")
});

var winners = 0;
var pickedNos = []

function rollIt(max) {
    var req = new XMLHttpRequest()
    req.open('GET', `/random/${max}`, true)
    req.onload = function() {
        let random = 1
        let allWinners = $('#all-winners').text()
        let allEmails = $('#all-emails').text()
        const data = JSON.parse(this.response)
        if (data.status == "success") {
            random = data.message[0]
            if (pickedNos.indexOf(random) == -1) {
                pickedNos.push(random)
                winners += 1;
                alertOn = `#name-${random}`
                $('#index-' + random).addClass('highlight')
                $('#winners-list').append(`<div><span class="raffle-winner-num col-sm-1">${winners}.</span><span class="raffle-winner col-sm-11"> ${$(alertOn + ' > .winner-name').text()} - ${$(alertOn + ' > .winner-position').text()}</span></div>`)
                $('#all-winners').text(`${allWinners}${$(alertOn + ' > .winner-name').text()};`)
                $('#all-emails').text(`${allEmails}${$(alertOn + ' > .winner-email').text().trim()};`)
            } else { console.log(`${random} (${$(alertOn).text().trim()}) exists in list: ${pickedNos}`) }
        }
    }
    req.send()

}

function saveWinners() {
    if (!confirm("Are you sure?")) {
        return;
    } else {
        console.log("Continuing to save :)")
    }
    let winners = $('#all-winners').text().slice(0, -1).split(';')
    let emails = $('#all-emails').text().slice(0, -1).split(';')
    let data = {
        title: $('#raffle-title').text().trim(),
        data: {
            winners: winners,
            emails: emails
        }
    }
    var req = new XMLHttpRequest()
    req.open('POST', `/winners`, true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(data))
}