// var bodyParser = require('body-parser');
// var express = require('express');
// var app = express();
// var util = require('util');
// var axios = require('axios').default;
// var bodyParser = require('socket.io-client');

// app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// app.use(bodyParser.json({type: 'application/json'}));
// app.get('/', function (req, res) {
//   res.send('Bitpump Cralwer Server :)');
// });
// var flag = true;
// var time_stamp = getTimeMilis();
// app.get('/upbit_project', function (req, res) {
  
//   if(flag){
//      time_stamp = getTimeMilis();
//   }
//   flag = !flag;
  
//   var url = util.format("https://project-team.upbit.com/api/v1/disclosure?region=kr&per_page=5&bitpump=%s", time_stamp)
  
//   //console.log('url',  req.body.url); 
//   //if (!!req.body.url) {
//     axios({
//         method: 'get',
//         url:url,
//         headers:{
//                   'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
//                   'Cache-Control': 'private,no-cache, no-store, must-revalidate,max-age=0,s-maxage=0,min-fresh=0 ,proxy-revalidate, max-stale=0, post-check=0, pre-check=0',
//                   'Pragma': 'no-cache',
//                   'Expires': '-1'
//         }
//       }).then(function (body) {
//         console.log("Success",body.headers);
//         res.status(200).send(body.data);
//       }).catch(function (error) {
//         console.log("error",req.body.url);
//         res.status(404).send(error.message);
//       })
//   //}
// });

var axios = require('axios').default;
var util = require('util');

const TYPE_CRAWLER = 'crawler'; 
const TYPE_BOT = 'bot';
const TYPE_ASSIST = 'assist';

function getTimeMilis() {
  return new Date().getTime();
}

upbitRequest();
setInterval(function(){
  upbitRequest();
},6000)

var flag = true;
var time_stamp = getTimeMilis();
function upbitRequest(){
  if(flag){
    time_stamp = getTimeMilis();
  }
  flag = !flag;
  var url = util.format("https://project-team.upbit.com/api/v1/disclosure?region=kr&per_page=5&bitpump=%s", time_stamp)
 
  axios({
       method: 'get',
       url:url,
       headers:{
                 'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36',
                 'Cache-Control': 'private,no-cache, no-store, must-revalidate,max-age=0,s-maxage=0,min-fresh=0 ,proxy-revalidate, max-stale=0, post-check=0, pre-check=0',
                 'Pragma': 'no-cache',
                 'Expires': '-1'
       }
     }).then(function (body) {
       console.log(body.headers["cf-cache-status"]);
       //if(serverSocket && body.headers["cf-cache-status"] == "HIT"){
       if(serverSocket){
         serverSocket.emit('notice', {
            result:'success',
            data:body.data,
            cache_status:body.headers["cf-cache-status"]
         });
       }
     }).catch(function (error) {
        console.log('error',error.response.headers["retry-after"]);
    })
}

var io = require('socket.io-client');
var serverSocket;


const PROXY_GATEWAY_ADDRESS = "https://crawlergateway.herokuapp.com"
//const PROXY_GATEWAY_ADDRESS = "http://localhost:3000"
const url = PROXY_GATEWAY_ADDRESS;

var socket = io(url, {
    transports: ['websocket'],
    reconnection: true,             // whether to reconnect automatically
    reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
    reconnectionDelay: 1000,        // how long to initially wait before attempting a new reconnection
    reconnectionDelayMax: 5000,     // maximum amount of time to wait between reconnection attempts. Each attempt increases the reconnection delay by 2x along with a randomization factor
    randomizationFactor: 0.5,
    extraHeaders: {
      type: TYPE_ASSIST
    }
});

var start_crawler = false;
const socketSubscribe = (socket, app) => {

  //socket.removeAllListeners();

  socket.on('connect', function () {
      console.log('connect');
      serverSocket = socket;
  });

  socket.on('disconnect', function () {
      console.log('disconnect');
  });

  socket.on('reconnect', function () {
      console.log('reconnect');
  });

  socket.on("reconnecting", function (delay, attempt) {
      console.log('reconnecting');
  });

};
socketSubscribe(socket, this);