var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var axios = require('axios').default;

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
        url:req.body.url,
        headers:{
                  'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
                  'Cache-Control': 'private,no-cache, no-store, must-revalidate,max-age=0,s-maxage=0,min-fresh=0 ,proxy-revalidate, max-stale=0, post-check=0, pre-check=0',
                  'Pragma': 'no-cache',
                  'Expires': '-1'
        }
      }).then(function (body) {
        console.log("Success",req.body.url);
        res.status(200).send(body.data);
      }).catch(function (error) {
        console.log("error",req.body.url);
        res.status(404).send(error.message);
      })
  }
});

var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Example app listening on port ', port);
});
