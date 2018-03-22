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
var APP_URL = "YOUR_PUBLISHED_WEB_APP_URL"

var DEFAULT_IMAGE = "DEFAULT_IMG_URL";
var HEADER = {
  header: {
    title: "Bot Name",
    subtitle:"Bot subtitle",
    imageUrl: DEFAULT_IMAGE,
    imageStyle: "IMAGE"
  }
}

/**
 * Responds to an ADDED_TO_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onAddToSpace(event) {
  console.info(event);
  var message = '';

  if (event.space.type == 'DM') {
    message = 'Give a nice welcome message to the user';
  } else {
    message = 'Thank you for adding me to ' + event.space.displayName;
  }

  return { text: message };
}

/**
 * Responds to a REMOVED_FROM_SPACE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onRemoveFromSpace(event) {
  console.info('Bot removed from ', event.space.name);
}

/**
 * Responds to a MESSAGE event in Hangouts Chat.
 *
 * @param {Object} event the event object from Hangouts Chat
 */
function onMessage(event) {
  var msg = event.message.text;

  msg = msg.split(" ");

  // Look up the search string in the spreadsheet
  // Return an array of video URLs with matching tags
  var videos = getLookup(msg);

  // Extract the video thumbnail from the YouTube API
  // Return an array of objects - videos.url, videos.thumbail
  var videoObjects = getVideos(videos);

  // return the card
  return buildCard(videoObjects);
}


/**
 * getVideos - Get matched video data to return in the bot
 *
 * @param  {Object[]} array - raw video URLs
 * @returns {Object[]} array
 */
function getVideos(array) {

  // Loop the URLs in the array
  for(var v=0; v<array.length; v++) {

    // Split to get the video ID
    var videoId = array[v].url.split("=")[1];

    // YouTube API v3, return the snippet with video metadata
    var videoResource = YouTube.Videos.list('snippet', {id:videoId });

    // Build the object for each video URL
    array[v].thumb = videoResource.items[0].snippet.thumbnails.standard.url;
    array[v].title = videoResource.items[0].snippet.title;
  }

  // send the object to build the response widget
  return array;
}


/**
 * getLookup - Get an array of videos matching the search key request
 *
 * @param  {Object[]} keys - Array of search terms
 * @returns {Object[]} matches - Array of video objects matched to the tag
 */
function getLookup(keys) {
  var sheet = ss.getSheetByName("db");
  var data = sheet.getDataRange().getValues();

  // Create an array to hold matching results
  var matches = [];

  // Build the regex
  var expr = '^';
  for(var s=0; s<keys.length; s++) {
    expr += '(?=.*\\b' + keys[s] + '.*\\b)';
  }
  expr += '.*$'
  expr = new RegExp(expr, "gi");

  for(var i=0; i<data.length;i++) {
    var string = data[i][0].concat(", ", data[i][1]);

    // Use string.match() instead of expr.test() because the latter advances the index, resulting in incomplete results.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test
    if(string.match(expr)) {
      matches.push({"url":data[i][4], "title":data[i][2]})
    }
  }

  // process the matches array to delete duplicate URLs
  var matches = uniqBy(matches, JSON.stringify);

  // A blank url key will cause an error on the YouTube API.
  // Remove any matches that have a blank URL field.
  matches = matches.filter(function(a) { return a.url !== "" });

  return matches;
}

/**
 * getLookup - Filter the array of objects with matching keys
 *
 * @param [Array] matches
 * @callback key - each [Array] item is filtered through the callback function
 * See https://stackoverflow.com/a/9229821/2278429 for filtering {Objects}
*/
function uniqBy(a, key) {
    var seen = {};
    return a.filter(function(item) {
        var k = key(item);
        return seen.hasOwnProperty(k) ? false : (seen[k] = true);
    })
}


/**
 * buildWidgets - Buld the widgets to display in the card
 *
 * @param  {Object[]} data
 * @param {string} data.title - video title
 * @param {string} data.thumb - video thumbnail
 * @param {string} data.url - link to the live YouTube video
 * @returns {Object[]} widgets
 */
function buildWidgets(data) {
  var widgets = [];

  // Determine plurality of results
  if(data.length == 0) {
    widgets.push({ textParagraph: { text: "I couldn't find any videos. <a href='" + APP_URL + "'>Check the website</a> for more articles that may help." } });
  } else if(data.length == 1) {
    widgets.push({
      textParagraph: { text: "I found " + data.length + " video that may help:" }
    });
  } else {
    widgets.push({
      textParagraph: { text: "I found " + data.length + " videos that may help:" }
    });
  }

  // Push each object into a widget to build a card
  for(var i=0; i<data.length; i++) {
    widgets.push(
      {
        keyValue: {
          content: data[i].title,
        }
      },
      {
        image: { imageUrl: data[i].thumb }
      },
      {
        buttons: [{
          textButton: {
            text: "OPEN VIDEO",
            onClick: {
              openLink: {
                url: data[i].url
              }
            }
          }
        }]
      }
    );
  }
  return widgets
}


/**
 * buildCard - Get the widgets and build the card for the bot
 *
 * @param  {Object[]} allResults - All matched results from the tag and platform search
 * @returns {json}
 */
function buildCard(allResults) {

  // Get the widgets
  var widgets = buildWidgets(allResults);

  var cardJson = {
    cards: [HEADER, {
      sections: [{
        widgets: widgets
      }]
    }]
  }

  return cardJson
}
