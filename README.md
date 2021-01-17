# Artisan Raffle Picker 

## A Node.JS application for integrating with Google Forms, Random.org and keeping a running blacklist for the naughty people :)

Not everything will be included since everyone runs forms a little different, but will try to include as much as I can think of that will be relevant to the most people. 

Feel free to fork it and do what you want!

## Setting it up

So setting this up is kinda shitty because Google Forms/Sheets/Drive doesn't allow you to just find the stuff. So you have to enable some APIs and generate some tokens on your Google account. I will do my best to document all of this but I don't actually remember everything that got it "working"

1. Clone/fork this repository
1. Rename `env_template` to `.env` and edit the contents
   1. Get your random.org api key
   1. Sign up for random.org and login
   1. Go to https://api.random.org/dashboard
   1. Create a new API key
   1. Put this in the file!
1. This is where it gets tricky, Google shit
    1. Go to https://console.developers.google.com/apis/dashboard and create a new project with a name you know
    1. Click `ENABLE APIS AND SERVICES`
    1. Search for Google Drive and enable it
    1. Search for Google Sheets and enable it
    1. Go back to the dashboard, then to `Credentials`
    1. Click `CREATE CREDENTIALS` and select `Service Account`
    1. Give it a name and stuff, and note down the email that is created (eg. getstuff@projectname.iam.gserviceaccount.com)
    1. Select `Basic` -> `Viewer` as the role and click `Continue`
    1. Leave the `Grant Users` fields blank and click `Done`
    1. Once back on the Credentials page, click the email in the `Service Accounts` section
    1.  In the `Keys` section click `Add Key` -> `Create New Key`
    1. Select `JSON` as the type and click `Create` which will download it.
    1. Rename the file to `creds.json` and put it in the root folder
1. Last step is to enable the account on Google Drive
    1. Go to https://drive.google.com and create a folder called `Forms`
    1. Right click on the `Forms` folder and click `Share`
    1. Share the folder with the email from step `vii` above and uncheck notify (you'll just get a DND if you leave it on)
    1. From now on all forms will go in that folder
1. When making new forms, make sure to put "raffle" in the name, so that spreadsheets with the form data also get named "raffle" 
    1. You can technically just put "raffle" in the spreadsheet name and not the form, but this is easier.
1. Now that all that is out of the way, time to install stuff
    1. Install NodeJS >= 15.3
    1. From CLI type `npm install --save` to install all packages required.
    1. Run `node webapp.js` to start and navigate to http://localhost:8080 (unless you've changed the port)
1. If everything is setup correctly and you have sheets in the `Forms` folder with `raffle` or `Raffle` in the name, you should see entries in the list
1. Once a form is selected, click the `Roll!` button to pick your winners
1. THIS SHOULD BE EVERYTHING BUT WHO THE FUCK KNOWS