var express = require('express');
var router = express.Router();
var Promise = require('promise');
const axios = require('axios').default;
const querystring = require('querystring');




const CLIENT_URL = process.env.CLIENT_URL;

/*  Spotify DOCUMENTATION
  Authorization: https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-flows
  Recomendation: https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/
*/


// The Spotify REQUIRED var
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_SECRET = process.env.SPOTIFY_SECRET;
const SERVER_CALLBACK_URL = process.env.SERVER_CALLBACK_URL;


/* Spotify API */
router.get("/spotify/callback", (req, res, next) => {
  const { code, error } = req.query;

  if (code !== undefined) { 
    // construct the required url and headers
    const token_url = "https://accounts.spotify.com/api/token?" +
      "grant_type=authorization_code" +
      "&code=" + code +
      "&redirect_uri=" + SERVER_CALLBACK_URL;
    const authorization = Buffer.from(SPOTIFY_CLIENT_ID + ":" + SPOTIFY_SECRET).toString('base64');
    const headers = {
      headers: {
        'Authorization': `Basic ${authorization}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }

    // get the access token and refresh token
    axios.post(token_url, null, headers)
      .then((response) => {
        if (response.status === 200) {
          const { access_token, refresh_token } = response.data;
          res.redirect(`${CLIENT_URL}/#` + querystring.stringify({
            access_token: access_token,
            refresh_token: refresh_token
          }));
        }
      }).catch((e) => { // if there is an error
        res.status(400).send({ "message": `${e.response.data.error_description}` })
      });

  }else{ // if user does not accept the request or an error has occurred
    res.status(400).send({"message": `${error}`});
  }

});


router.get("/music", (req, res, next) => {

  if(req.query.access_token != undefined){
    let seed = "4NHQUGzhtTLFvgF5SZesLK";
  
    // constructing the GET Spotify music recommendation URL
    const url = "https://api.spotify.com/v1/recommendations?" + 
                "seed_artists=" + seed;


    // constructing the required headers for making the call to the Spotify API
    const config = {
      headers: {
        "Authorization" : `Bearer ${req.query.access_token}`,
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
                     if(lyric_res.data.lyrics != undefined){ 
                        lyrics.push(lyric_res.data.lyrics);
                     }else{
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

  }else{
    res.status(400).res({"message" : "Invalid access_token"});
  }
});


module.exports = router;
