# Apps-Script-Knowledgebase-Suite

Build a functional user knowledgebase using a Google Sheet. It includes a web app and chat bot that can be installed separately. This is not as easy as some other scripts, so please read the instructions carefully. Questions can be submitted using the Issues tab on the repo or by leaving a comment [on the blog post](NEED BLOG URL) going into more detail about limitations.

## Requirements

- The web app and Sheet can be set up in any Google account.
- The chat bot needs to be enabled in a GSuite domain by the administrator.

## Installation

There are two components if you want to use both a web app and the chat bot.

### Web app deployment

1. Make a copy of the template spreadsheet. This will also copy `app.gs` and `webapp.html`.
2. The `db` and `platform` sheets need data. `authUsers` is not required, but anyone visiting the app will be able to add articles through the form.
3. Open the Script Editor (Tools > Script editor)
4. In `app.gs`, you need to set your spreadsheet key in line 23.
5. Go to Publish > Deploy as web app. Run as you, available to your domain (or anyone).
6. Make note of the published web app URL if you're going to deploy a chat bot (see step 3 below).

### Bot deployment

[Bot deployment is more involved and covered in depth in Google's documentation](https://developers.google.com/hangouts/chat/how-tos/bots-apps-script). You'll deploy from Apps Script. Because this uses the YouTube API, you need to enable it for the project.

1. Create a blank Script file in Drive.
2. Copy and paste `helpBot.gs` into the script.
3. Set the following variables:
  - The database spreadsheet key (line 22)
  - Published web app url (line 24)
  - Bot default image URL (line 26)
  - Bot name (line 29)
  - Bot subtitle (line 30)
4. Open your Apps Script manifest file in View > Show manifest file. Copy and paste `appsscript.json` into this file.
5. Click on Publish > Deploy from manifest...
6. To test, you can publish from the latest version. If you're deploying for the domain, you need to create a new version. Copy the ID for the version you're using.
7. Click on Resource > Cloud Platform Project. Click on the link in the dialog to go to the web settings.
8. Click on APIs & Services in the menu on the left. Click on Enable APIs on the top of the next page.
9. Search for and Enable the YouTube Data (v3) API.
10. Search for and enable the Hangouts Chat API.
11. In the Hangouts Chat API settings, click on Configure.
12. Set the bot name, avatar URL, and description. Check both rooms and DMs. Paste the deployment ID in the Apps Script box.
13. If you're deploying the latest version, change "Who can install" to specific users and enter your email. Otherwise, everyone can install.
14. Click save.

## Testing

Once your bot is deployed, you can test it by downloading the [Hangouts Chat client](https://get.google.com/chat). Find the bot and send it a message to test.

## Links

- Demo spreadsheet structure
- See https://ohheybrian.com/blog for more information

## License

### Apps Script Knowledgebase Suite

Copyright 2018 Brian Bennett

Permission is hereby granted, free of charge, to any person obtaining a copy of this software
and associated documentation files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
