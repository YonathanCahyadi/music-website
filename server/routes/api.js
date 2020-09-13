var express = require('express');
var router = express.Router();
var Promise = require('promise');
const axios = require('axios').default;



/*  Spotify DOCUMENTATION
  Authorization: https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-flows
  Recomendation: https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/
*/

// The Spotify REQUIRED var
router.get("/music", (req, res, next) => {

  if (req.query.access_token != undefined) {
    let seed = "4NHQUGzhtTLFvgF5SZesLK";

    // constructing the GET Spotify music recommendation URL
    const url = "https://api.spotify.com/v1/recommendations?" +
      "seed_artists=" + seed;

    // constructing the required headers for making the call to the Spotify API
    const config = {
      headers: {
        "Authorization": `Bearer ${req.query.access_token}`,
        "Content-Type": "application/json"
      }
    };


    const LYRIC_API_BASE_URL = "https://api.lyrics.ovh/v1";
    let lyric_api_url = [];
    let lyrics = [];

    // get the recommendation music from spotify
    axios.get(url, config)
      .then((spotify_res) => {

        // constructing the url for getting the lyric and artist Images
        spotify_res.data.tracks.map((t) => {
          lyric_api_url.push(`${LYRIC_API_BASE_URL}/${t.album.artists[0].name}/${t.name}`);
        });

        // getting the lyric from the lyrics.ovh API
        const requestsLyric = () => {
          return Promise.all(lyric_api_url.map((url) => {
            return axios.get(url)
              .then((lyric_res) => {
                // Check if lyric is found
                if (lyric_res.data.lyrics != undefined) {
                  lyrics.push(lyric_res.data.lyrics);
                } else {
                  lyrics.push(null);
                }
              })
              .catch((e) => {
                lyrics.push(null);
              }); // catch the error when getting the lyric form the lyric.ovh API
          }));
        }

        // wait until finish getting all the lyric
        requestsLyric()
          .then(() => {
            // making the data to be sended to the client
            let response = {};
            let data = [];
            spotify_res.data.tracks.map((t, i) => {
              data[i] = {
                songTitle: t.name,
                songUrl: t.external_urls.spotify,
                artistName: t.album.artists[0].name,
                artistImages: t.album.images[0].url,
                previewUrl: t.preview_url,
                popularity: t.popularity,
                lyric: lyrics[i]
              };
            });

            response = {
              data: data
            }

            return response;
          }).then((response) => {
            // send the constructed response to the client
            res.status(200).send(response);
          })

      })

      .catch((e) => { // catch the error when getting the data from Spotify API
        res.status(400).send({ "message": `${e}` })
      });

  } else {
    res.status(400).res({ "message": "Invalid access_token" });
  }
});


module.exports = router;
