function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("webapp");
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
  var results = [];
  var db = ss.getSheetByName('db');
  var allTags = db.getRange(2,2,db.getLastRow(),1).getValues();
  var data = db.getRange(2,1,db.getLastRow(),db.getLastColumn()).getValues();
  var tags = formObject.tags.split(", ");
  
//  Logger.log(allTags);
//  // process the tags
//  if(tags.length > 0) {
//    for(var n in allTags) {
//      for(var m in tags) {
//        Logger.log(allTags[n].indexOf(tags[m]))
//      }
//    }
//    
//  }
  
  // find matching resources
  for(var i=0; i<data.length; i++) {
    if(data[i][0] == formObject.platform) {
      if(formObject.tags.length == 0) {
        results.push(
          {
            tags: data[i][1],
            title: data[i][2],
            desc: data[i][3],
            vid: data[i][4],
            img: data[i][5]
          }
        )
      } else {
        for(var n in tags) {
          if(data[i][1].indexOf(tags[n].toLowerCase()) > -1) {
            results.push(
              {
                tags: data[i][1],
                title: data[i][2],
                desc: data[i][3],
                vid: data[i][4],
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