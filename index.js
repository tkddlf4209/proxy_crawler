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

function getTimeMilis() {
  return new Date().getTime();
}

var flag = true;
var time_stamp = getTimeMilis();
var err = false;
upbitRequest();
var randDelay = randDelay(500,5000);
setTimeout(function(){ // 랜덤 딜레이 이후 실행
  setInterval(function(){ // 1초 간격으로 프로젝트 공지 갱신
    upbitRequest();
  },1000)
},randDelay);

setInterval(function(){ 
  if(err){
    selfRestart(); // 에러발생시 재실행
  }
},3000)

var slow_cralwer;
function startUpbitProjectCrawler(interval){
  if(start_crawler){ 
    console.log('#STOP slow cralwer#');
    clearInterval(slow_cralwer); 
    upbitRequest(); // start immediately once
    setInterval(function(){
      upbitRequest();
    },interval)
  }else{// gateway에서 시작요청을 하지않았을 경우 
    console.log('#START slow cralwer#');
    slow_cralwer = setInterval(function(){
      upbitRequest();
    },interval)
  }
}
var send_fail_flag = true;
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

        if(error.response.headers["retry-after"]){
          err = true;
          // if(start_crawler && send_fail_flag){ // 빠른 크롤로가 동작중일 겨우에만 fail 시 한번 전송
          //   serverSocket.emit('notice', {
          //     result:'fail'
          //   });
          //   send_fail_flag=false;
          // }
        }
    })
}

// var port = process.env.PORT || 3000;
// app.listen(port, function () {
//   console.log('Example app listening on port ', port);
// });

var io = require('socket.io-client');
var serverSocket;

//console.log(process.env);
const PROXY_GATEWAY_ADDRESS = "https://crawlergateway.herokuapp.com"
//const PROXY_GATEWAY_ADDRESS = "http://localhost:3000"
const url = PROXY_GATEWAY_ADDRESS;
const HEROKU_APP_NAME = process.env.HEROKU_APP_NAME || 'APP_NAME_UNDEFINED';

var socket = io(url, {
    transports: ['websocket'],
    reconnection: true,             // whether to reconnect automatically
    reconnectionAttempts: Infinity, // number of reconnection attempts before giving up
    reconnectionDelay: 1000,        // how long to initially wait before attempting a new reconnection
    reconnectionDelayMax: 5000,     // maximum amount of time to wait between reconnection attempts. Each attempt increases the reconnection delay by 2x along with a randomization factor
    randomizationFactor: 0.5,
    extraHeaders: {
      type: TYPE_CRAWLER
    }
});

var start_crawler = false;
const socketSubscribe = (socket, app) => {

  //socket.removeAllListeners();

  // socket.on('start_crawler', function (data) {
    
  //   if(!start_crawler){
  //     start_crawler = true;
  //     console.log("start_crawler#####",data);
  //     socket.emit('start_crawler','start_crawler');
  //     startUpbitProjectCrawler(data.interval)
  //   }
  // });
 
  socket.on('connect', function () {
      console.log('connect');
      serverSocket = socket;
      error_flag = true;
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

var request = require("request");
const TOKEN = '17a48625-de4b-447c-ac52-1b2124b59878';
function selfRestart() {
  console.log('selfRestart','https://api.heroku.com/apps/' + HEROKU_APP_NAME + '/dynos/');
  
  request({
      url: 'https://api.heroku.com/apps/' + HEROKU_APP_NAME + '/dynos/',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.heroku+json; version=3',
        'Authorization': 'Bearer ' + TOKEN   
      }
    }, function (error, response, body) {
      if(error){
        console.log(error);
      }
  });

}

function randDelay(start, end)
{
    return Math.floor((Math.random() * (end-start+1)) + start);
}
