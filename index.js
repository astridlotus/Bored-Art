/**
 * Astrid Bowden
 *
 * This file adds interactivity and API implementation to the
 * gallery
 */

//  https://api.artic.edu/api/v1/artworks/search?limit=100&q=cats&query[term][is_public_domain]=true

"use strict";
(function () {
  window.addEventListener("load", init);
  const BORED_BASE = "http://www.boredapi.com/api/activity/";
  const ART_BASE = "https://api.artic.edu/api/v1/artworks";

  function init() {
    console.log("hello");
    let generateAll = document.querySelector("button");
    let artOnly = document.getElementById("art-button");

    generateAll.addEventListener("click", makeBoredRequest);
    artOnly.addEventListener("click", () => {
      let answer = document.getElementById("answer");
      answer.innerHTML = "";
      makeArtQueryRequest(
        "/search?limit=100&query[term][is_public_domain]=true",
        null
      );
    });
  }

  /**
   * This function makes a random request to the Bored API, so no queries
   * are needed
   */
  async function makeBoredRequest() {
    try {
      let url = BORED_BASE;
      const response = await fetch(url);
      await statusCheck(response);
      const json = await response.json();
      findActivity(json);
    } catch (error) {
      handleError(error);
    }
  }

  /**
   * This is a helper function to display a error message depending on
   * what issue occured
   * @param {String} messageText message to be displayed.
   */
  function showMessage(messageText) {
    let answer = document.getElementById("answer");
    answer.innerHTML = "";
    let message = document.createElement("span");
    message.id = "error";
    message.textContent = messageText;
    answer.appendChild(message);
  }

  /**
   * This function add the response from the Bored API to the webpage and
   * creates a query for the museum API based on that information
   * @param {Object} responseData Bored API response
   */
  function findActivity(responseData) {
    let answer = document.getElementById("answer");
    let activity = document.createElement("h3");
    activity.id = "activity";
    let type = responseData.type;
    answer.innerHTML = "";
    console.log(responseData);

    // activity.textContent = responseData.activity;
    answer.appendChild(activity);
    if (type === "busywork") {
      type = "busy";
    } else if (type === "diy") {
      type = "work";
    }
    console.log(type);
    let query =
      "/search?limit=100&query[term][is_public_domain]=true&q=" + type;
    makeArtQueryRequest(query, responseData);
    // console.log(query);
  }

  /**
   * This function makes two requests to the art API, first to find the first
   * 100 data points in the API that match the query, then selecting one at random
   * to find its image.
   * @param {*} query
   */
  async function makeArtQueryRequest(query, activityData) {
    try {
      let url = ART_BASE + query;
      let res = await fetch(url);
      await statusCheck(res);
      let data = await res.json();
      // console.log(data.data);
      let objectData = data.data;

      let num = Math.floor(Math.random() * objectData.length);
      let uniqueID = objectData[num].id;
      console.log(uniqueID);
      let uniqueData = await specificArtRequest(uniqueID);

      if (uniqueData.data.image_id === null) {
        console.log("no img for " + uniqueID);
        // If image_id is null, make another specificArtRequest recursively
        return makeArtQueryRequest(query, activityData);
      } else {
        appendImg(uniqueData, activityData);
        // Image_id is not null, perform desired actions
        // ...
        console.log(uniqueData);
      }
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function is a gt request which gets the information about a specific
   * piece of artwork.
   * @param {String} uniqueID unique ID of the artwork
   */
  async function specificArtRequest(uniqueID) {
    try {
      let url = ART_BASE + "/" + uniqueID;
      let res = await fetch(url);
      await statusCheck(res);
      let resData = await res.json();
      // console.log(resData);
      // appendImg(resData, activityData);
      return resData;
      // await retrieveImg(data);
    } catch (err) {
      handleError(err);
    }
  }

  /**
   * This function appends the image and the activity to the page.
   * @param {Object} resData This object contains information about the art
   * @param {Object} activityData This json object contains the activity
   */
  function appendImg(resData, activityData) {
    let pActivity = document.getElementById("activity");
    let answer = document.getElementById("answer");
    if (activityData) {
      pActivity.textContent = activityData.activity;
    }
    console.log("config : " + resData.config.iiif_url);
    console.log("imageid:" + resData.data.image_id);
    let img = document.createElement("img");
    img.src =
      resData.config.iiif_url +
      "/" +
      resData.data.image_id +
      "/full/600,/0/default.jpg";
    console.log(img.src);
    // img.src = data.config + "/" + data.image_id + "/full/843,/0/default.jpg";
    // console.log(src);
    answer.appendChild(img);
    addCitiation(resData, answer);
  }

  function addCitiation(data, answer) {
    let citation = "";

    if (data.data.artist_title) {
      citation += data.data.artist_title + ". ";
    }

    if (data.data.title) {
      citation += '"' + data.data.title + '". ';
    }

    if (data.data.date_display) {
      citation += data.data.date_display + ". ";
    }

    if (data.data.medium_display) {
      citation += data.data.medium_display + ". ";
    }

    citation += "Art Institute of Chicago, Chicago";

    console.log(data);
    console.log(answer);
    let cite = document.createElement("footer");
    cite.textContent = citation;
    answer.appendChild(cite);
  }

  /**
   * This is a status check function for the fetch functions
   * @param {Object} res response
   * @returns {error} an error if code not within range, otherwise response
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * this function handles errors if a fetch to any API fails, if it does,
   * an error message is shown.
   */
  function handleError() {
    let answer = document.getElementById("answer");
    answer.innerHTML = "";
    showMessage("Whoops! Fetch Failed, You might be offline...");
  }
})();
