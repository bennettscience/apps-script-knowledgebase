/*
 * Apps Script Knowledgebase Suite v0.1
 * Copyright 2018 Brian Bennett
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software
 * and associated documentation files (the "Software"), to deal in the Software without restriction,
 * including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 *
 * See https://ohheybrian.com/blog for more information on using the Knowledgebase Suite
 * See also https://github.com/bennettscience/apps-script-knowledgebase for technical details
 *
*/

var ss = SpreadsheetApp.openById("YOUR_SS_KEY");
var sheet = ss.getSheetByName("db");

function doGet(e) {
  var params = e.parameter;
  var template = HtmlService.createTemplateFromFile("webapp");
  template.data = JSON.stringify(params)
  return template.evaluate();
}

function getPlatforms() {
  var sheet = ss.getSheetByName("platforms");
  return sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
}

/**
 * Find matching resources based on user input
 * @param {Object} formObject
 * @param {string} formObject.platform
 * @param {string} formObject.tags
 * @returns {Object[]} results
*/
function getResources(formObject) {

  var results = [];
  var db = ss.getSheetByName('db');
  var data = db.getRange(2,1,db.getLastRow(),db.getLastColumn()).getValues();

  // find matching resources
  for(var i=0; i<data.length; i++) {
    if(data[i][0].toLowerCase() == formObject.platform.toLowerCase()) {
      if(!formObject.tags) {
        results.push(
          {
            tags: data[i][1],
            title: data[i][2],
            desc: data[i][3],
            url: data[i][4],
            img: data[i][5]
          }
        )
      } else {
        var tags = formObject.tags.split(",");
        for(var n in tags) {
          if(data[i][1].toLowerCase().indexOf(tags[n].toLowerCase()) > -1) {
            results.push(
              {
                tags: data[i][1],
                title: data[i][2],
                desc: data[i][3],
                url: data[i][4],
                img:data[i][5]
              }
            )
          }
        }
      }
    }
  }
  Logger.log(results);
  return results;
}


/**
 * addNewArticle - Write a new knowledgebase article in the database
 *
 * @param  {Object} formObject
 * @param {string} formObject.title - Article title
 * @param {string} formObject.desc - Article details, HTML formatted
 * @param {string} formObject.tags - comma-separated descriptors
 * @returns {string} - success or failure message to the client
 */
function addNewArticle(formObject) {
  if(formObject.title == "" || formObject.desc == "" || formObject.tags == "") {
    throw new Error("Please complete the required items on the form to submit.");
  }

  try {
    var sheet = ss.getSheetByName('db');
    var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1;

    sheet.getRange(nextRow, 1, 1, 6).setValues([ [formObject[headers[0]], formObject[headers[1]], formObject[headers[2]], formObject[headers[3]], formObject[headers[4]], formObject[headers[5]] ] ]);

    return "Article submitted successfully."
  } catch(e) {
    return e.message;
  }
}


/**
 * getAuth - Gets current user authorization status
 * @returns {boolean}
 */
function getAuth() {
  var user = Session.getActiveUser().getEmail();
  var sheet = ss.getSheetByName('authUsers');
  var users = sheet.getRange(1,1,sheet.getLastRow(), 1).getValues();

  if(users[0].indexOf(user) > -1) {
    return true;
  } else {
    return false;
  }
}
