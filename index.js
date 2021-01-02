var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var request = require('request');
var axios = require('axios').default;
request.defaults({
    headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36',
	    'Cache-Control': 'private,no-cache, no-store, must-revalidate,max-age=0',
        'Pragma': 'no-cache',
        'Expires': 0
    }
})
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(bodyParser.json({type: 'application/json'}));
app.get('/', function (req, res) {
  res.send('Bitpump Cralwer Server :)');
});
 
app.post('/proxy', function (req, res) {
  console.log('url',  req.body.url); 
  if (!!req.body.url) {
    axios({
        method: 'get',
        url:req.body.url
      }).then(function (body) {
        res.send(body.data);
        console.log("Success");
      }).catch(function (error) {
        res.send(error.message);
        console.log("axios Error", error.message);
      })
  }
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});