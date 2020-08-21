var express = require('express');
var router = express.Router();
const axios = require('axios').default;


/*  Spotify DOCUMENTATION
  Authorization: https://developer.spotify.com/documentation/general/guides/authorization-guide/#authorization-flows
  Recomendation: https://developer.spotify.com/documentation/web-api/reference/browse/get-recommendations/
*/


// The Spotify REQUIRED var
const SPOTIFY_CLIENT_ID = "86f3cd84bbeb49889050b07f94a47b81";
const SPOTIFY_SECRET = "e8c4be4bcaca46b887462ec45bd7839c";
const CALLBACK_URL = "http://localhost:3000/api/spotify/callback"


/* Spotify API */
router.get('/spotify/authorize', (req, res, next) => {

  // Construct the required URL
  const authorization_url = "https://accounts.spotify.com/authorize?" +
    "client_id=" + SPOTIFY_CLIENT_ID +
    "&response_type=code" +
    "&redirect_uri=" + CALLBACK_URL;
  // re-direct user to the authorization url to get the code needed for getting the access token and refresh token
  res.redirect(authorization_url);

});

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
          res.status(200).send({ "message": "access token and refresh token granted" });
        }
      }).catch((e) => { // if there is an error
        res.status(400).send({ "message": `${e.response.data.error_description}` })
      });
  }else{ // if user does not accept the request or an error has occurred
    res.status(400).send({"message": `${error}`});
  }

});



module.exports = router;
