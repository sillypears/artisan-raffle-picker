$(function() {

    console.log("Oh shit a raffle")


    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
    }
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
                console.log(`random # ${random} out of ${max}`)
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
    let gsheetId = $('#gsheet-id').text().trim();
    let data = {
        title: $('#raffle-title').text().trim(),
        data: {
            winners: winners,
            emails: emails,
            gsheetId: gsheetId
        }
    }
    var req = new XMLHttpRequest()
    req.open('POST', `/savewinners`, true);
    req.setRequestHeader('Content-Type', 'application/json')
    req.send(JSON.stringify(data))
}