function doGet(e) {
  var params = e.parameter;
  var template = HtmlService.createTemplateFromFile("webapp");
    Logger.log(params);
    template.data = JSON.stringify(params)
    return template.evaluate();
}

function getPlatforms() {
  var sheet = ss.getSheetByName("platforms");
  return sheet.getRange(1, 1, sheet.getLastRow(), 1).getValues();
}

/* 
 * @param {Object} - obj.tags, obj.platform
 * return [Array]
*/
function getResources(formObject) {
  Logger.log(formObject);
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

function addNewArticle(formObject) {
  if(formObject.title == "" || formObject.desc == "" || formObject.tags == "") {
    throw new Error("Please complete the required items on the form to submit.");
  }
  
  try {
    var sheet = ss.getSheetByName('db');
    var headers = sheet.getRange(1,1,1,sheet.getLastColumn()).getValues()[0];
    var nextRow = sheet.getLastRow()+1;
    
    Logger.log(formObject);
    
    sheet.getRange(nextRow, 1, 1, 6).setValues([ [formObject[headers[0]], formObject[headers[1]], formObject[headers[2]], formObject[headers[3]], formObject[headers[4]], formObject[headers[5]] ] ]);
    
    return "Article submitted successfully."
  } catch(e) {
    return e.message;
  }
}

function getAuth() {
  var user = Session.getActiveUser().getEmail();
  var sheet = ss.getSheetByName('authUsers');
  var users = sheet.getRange(1,1,sheet.getLastRow(), 1).getValues();
  
  Logger.log(users);
  Logger.log(users[0].indexOf(user));
  if(users[0].indexOf(user) > -1) {
    return true;
  } else {
    return false;
  }
}