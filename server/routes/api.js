var express = require('express');
var router = express.Router();
const axios = require('axios').default;
const querystring = require('querystring');



const CLIENT_URL = "http://localhost:3001";

/*  Spotify DOCUMENTATION
  Authorization: https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-flows
  Recomendation: https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/
*/


// The Spotify REQUIRED var
const SPOTIFY_CLIENT_ID = "86f3cd84bbeb49889050b07f94a47b81";
const SPOTIFY_SECRET = "e8c4be4bcaca46b887462ec45bd7839c";
const CALLBACK_URL = "http://localhost:3000/api/spotify/callback"


/* Spotify API */

router.get("/spotify/callback", (req, res, next) => {
  const { code, error } = req.query;

  if (code !== undefined) { 
    // construct the required url and headers
    const token_url = "https://accounts.spotify.com/api/token?" +
      "grant_type=authorization_code" +
      "&code=" + code +
      "&redirect_uri=" + CALLBACK_URL;
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
    
    // constructing the GET Spotify music recommendation URL
    const url = "https://api.spotify.com/v1/recommendations?" + 
                "seed_artists=" + "4NHQUGzhtTLFvgF5SZesLK";


    // constructing the required headers for making the call to the Spotify API
    const config = {
      headers: {
        "Authorization" : `Bearer ${req.query.access_token}`,
        "Content-Type": "application/json"
      }
    };

    // get the recommendation music from spotify
    axios.get(url, config)
         .then((spotify_res) => {
           // get the lyric 
           const lyric_api_base_url = "https://api.lyrics.ovh/v1";
           let lyric_api_url = [];
           let lyrics = [];

           // constructing the url for getting the lyric
           spotify_res.data.tracks.map((t) => {
              lyric_api_url.push(`${lyric_api_base_url}/${t.album.artists[0].name}/${t.name}`);
           });
           

           // getting the lyric from the lyrics.ovh API
           const requests = lyric_api_url.map((url) => {
              axios.get(url)
                   .then((lyric_res) => lyrics.push(lyric_res.data.lyrics))
                   .catch((e) => res.status(400).send({"message": `${e}`})); // catch the error when getting the lyric form the lyric.ovh API
           });

           // wait until finish getting all the lyric
           Promise.all(requests)
                  .then(() => { // making the data to be sended to the client
                    let data = [];
                    spotify_res.data.tracks.map((t, i) => {
                      data[i] = {
                        song_title: t.name,
                        artists_name: t.album.artists[0].name,
                        lyric: lyrics[i]
                      };
                    });

                    res.status(200).send(data);

                  })
                  .catch((e) => console.log(e));


         }).catch((e) => { // catch the error when getting the data from Spotify API
           res.status(400).send({ "message": `${e}` })
         });

  }else{
    res.status(400).res({"message" : "Invalid access_token"});
  }
});


module.exports = router;
