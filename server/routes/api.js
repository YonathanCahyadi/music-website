var express = require('express');
var router = express.Router();
var Promise = require('promise');
const axios = require('axios').default;
const querystring = require('querystring');
const { response } = require('express');
const { info } = require('console');



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

router.get("/user", (req, res) => {
  const user_info_url = "https://api.spotify.com/v1/me";
  // constructing the required headers for making the call to the Spotify API
  const config = {
    headers: {
      "Authorization" : `Bearer ${req.query.access_token}`,
      "Content-Type": "application/json"
    }
  };

  let resJson = {};
  let userAvatar = null;
  let userName = null;

  // get user info 
  axios.get(user_info_url, config)
       .then((user_res) => {
         userName = user_res.data.display_name;
         if(user_res.data.images.length != 0){
           userAvatar = user_res.data.images[0].url;
         }

        resJson = {
          info: {
            userName: userName,
            userAvatar: userAvatar
          }
        }

        // send back to the client
        res.status(200).send(resJson);
       });

});

router.get("/music", (req, res, next) => {
  if(req.query.access_token != undefined){
    
    let resJson = {};

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
          //  // constructing the url for getting the lyric and artist Images
          //  spotify_res.data.tracks.map((t) => {
          //     lyric_api_url.push(`${lyric_api_base_url}/${t.album.artists[0].name}/${t.name}`);
          //  });
           

          //  // getting the lyric from the lyrics.ovh API
          //  const requestsLyric = lyric_api_url.map((url) => {
          //         axios.get(url)
          //          .then((lyric_res) => {
          //            console.log(lyric_res.data)
          //            // Check if lyric is found
          //            if(lyric_res.data.lyrics != undefined){ 
          //               lyrics.push(lyric_res.data.lyrics);
          //               //console.log(lyric_res.data.lyrics);
          //            }else{
          //              lyrics.push(null);
          //              //console.log(lyric_res.data.error);
          //            }
          //           })
          //          .catch((e) => lyrics.push(null)); // catch the error when getting the lyric form the lyric.ovh API
          //         });

          //  // get user Info from spotify
          //  const user_info_url = "https://api.spotify.com/v1/me";
          //  let userName = null;
          //  let userAvatar = null;
          //  const requestUserInfo = axios.get(user_info_url, config)
          //                               .then((user_res) => {
          //                                 console.log(user_res.data)
          //                                 userName = user_res.data.display_name;
          //                                 userAvatar = user_res.data.images[0].url;
          //                                 console.log(userName);
          //                                 console.log(userAvatar);
          //                               })
          //                               .catch((e) => res.status(400).send({"message": `${e}`})); // catch the error when getting the the user Info from Spotify

          // extract the data from the spotify API
          let data = [];
          spotify_res.data.tracks.map((t, i) => {
            data[i] = {
              songTitle: t.name,
              songUrl: t.external_urls.spotify,
              artistName: t.album.artists[0].name,
              artistImages: t.album.images[0].url,
              previewUrl: t.preview_url,
              popularity: t.popularity
            };
          });

          resJson = {
            data: data
          }

          return spotify_res.data.tracks;

          //  // wait until finish getting all the lyric
          // return Promise.all(requestsLyric)
          //         .then((val) => { // making the data to be sended to the client
          //           console.log(val);
          //           let response = {};
          //           let info = {
          //             userName: userName,
          //             userAvatar: userAvatar
          //           }
          //           let data = [];
          //           spotify_res.data.tracks.map((t, i) => {
          //             data[i] = {
          //               songTitle: t.name,
          //               songUrl: t.external_urls.spotify,
          //               artistName: t.album.artists[0].name,
          //               artistImages: t.album.images[0].url,
          //               previewUrl: t.preview_url,
          //               popularity: t.popularity,
          //               lyric: lyrics[i]
          //             };
          //           });

          //           response = {
          //             info: info,
          //             data: data
          //           }

          //           return response;
          //       }).then((response) => res.status(200).send(response));

         }).then((spotify_track) => { // get the lyric from lyric.ovh API

            // get the lyric 
            const lyric_api_base_url = "https://api.lyrics.ovh/v1";
            let lyric_api_url = [];
            let lyrics = [];

            // constructing the url for getting the lyric and artist Images
          //  spotify_track.map((t) => {
          //     lyric_api_url.push(`${lyric_api_base_url}/${t.album.artists[0].name}/${t.name}`);
          //  });

           
            Promise.allSettled(
              spotify_track.map((t) => axios.get(`${lyric_api_base_url}/${t.album.artists[0].name}/${t.name}`)))
                  .then((response) => {
                    console.log(response.status)
                    response.map(r => lyrics.push(r.data.lyrics))
                  }).then(() => {
                    lyrics.map((r, i) => {
                      resJson.data[i]["lyric"] = r;
                    })
                    res.status(200).send(resJson) 
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
