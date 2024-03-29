var axios = require('axios').default;
var util = require('util');

const TYPE_CRAWLER = 'crawler'; 
const TYPE_BOT = 'bot';

function getTimeMilis() {
  return new Date().getTime();
}

var err = false;
var start_crawler = false;
// upbitRequest();
// var crawl_delay = randDelay(500,5000);
// var restart_delay = randDelay(4000,7000);
// setTimeout(function(){ // 랜덤 딜레이 이후 실행
//   setInterval(function(){ // 1초 간격으로 프로젝트 공지 갱신
//     upbitRequest();
//   },1000)
// },crawl_delay);

var undefined_count = 0;
var time_stamp = getTimeMilis();
function upbitRequest(){
  time_stamp = getTimeMilis();
  var url = util.format("https://project-team.upbit.com/api/v1/disclosure?region=kr&per_page=20&bitpump=%s", time_stamp)
 
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
//        if(body.headers["cf-cache-status"]){
//           if(cache != body.headers["cf-cache-status"]){
//             flag= true;   
//           }
//           cache = body.headers["cf-cache-status"]
//        }
      
       //if(serverSocket && body.headers["cf-cache-status"] == "HIT"){
       if(serverSocket){
         serverSocket.emit('notice', {
            result:'success',
            data:body.data
         });
       }
     }).catch(function (error) {
        console.log('error',error.response.headers["retry-after"]);
        if(error.response.headers["retry-after"]){
          
          undefined_count = 0;
          if(err == false){
            err = true;
            selfRestart();
            setInterval(function(){ 
              if(err){
                selfRestart(); // 에러발생시 재실행
              }
            },10000) // 만약 앱이 재실행되지 않으면 // 10초에 한번씩 앱 재실행 
          }
        }else{
          undefined_count++;
          if(undefined_count>5){
              if(err == false){
                err = true;
                selfRestart();
                setInterval(function(){ 
                  if(err){
                    selfRestart(); // 에러발생시 재실행
                  }
                },10000) // 만약 앱이 재실행되지 않으면 // 10초에 한번씩 앱 재실행 
              }
          }
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


var notice_err = false;
function requestUpbitNotice(){
  var url = "https://api-manager.upbit.com/api/v1/notices?page=1&per_page=1&bitpump=" + Date.now();
  axios({
    method: 'get',
    url: url,
    timeout: 1500
  }).then(function (response) {
    if(response.data && serverSocket){
       serverSocket.emit('upbit_notice', response.data);
       console.log('upbit_notice');
    }
  }).catch(function (error) {
    if(notice_err == false){
      notice_err = true;

      selfRestart();
      setInterval(function(){ 
        if(err){
          selfRestart(); // 에러발생시 재실행
        }
      },10000)  // 만약 앱이 재실행되지 않으면 // 10초에 한번씩 앱 재실행 
    }
    console.log('upbit crawler error@', error.response.headers['retry-after']);
  })
}


setInterval(()=>{
  requestUpbitNotice();
},400);
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
      serverSocket = undefined;
  });

  socket.on('reconnect', function () {
      console.log('reconnect');
      serverSocket = socket;
  });

  socket.on("reconnecting", function (delay, attempt) {
      console.log('reconnecting');
  });

};
socketSubscribe(socket, this);

var request = require("request");
const TOKEN = '17a48625-de4b-447c-ac52-1b2124b59878';
//const TOKEN = '874aad36-8541-442c-b7b9-d5dffe2e60e6'; //jjun
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
