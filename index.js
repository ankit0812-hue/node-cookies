const express = require('express');
const http = require('http');
const morgan = require('morgan');
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const dishRouter = require('./routes/dishRouter');
const promoRouter = require('./routes/promoRouter');
const leaderRouter = require('./routes/leaderRouter');
const mongoose = require('mongoose');
const Dishes = require('./models/dishes');

const url = 'mongodb://localhost:27017/conFusion';
const connect = mongoose.connect(url);

connect.then((db) =>{
      console.log('Connected correctly to server');
},(err) =>{
      console.log(err);
});
const hostname = 'localhost';
const port = 3000;
const app = express();
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser('12345-67890-09876-54321'));
function auth(req,res,next){
      console.log(req.signedCookies);
      if(!req.signedCookies.user){
            var authHeader = req.headers.authorization;
           if(!authHeader){
           var err = new Error('You are not authenticated!');
           res.setHeader('WWW-Authenticate','Basic');
           err.status = 401;
           next(err);
      }
      var auth = new Buffer(authHeader.split(' ')[1],'base64').toString().split(':');
      if(auth[0]==='admin'&&auth[1]==='password'){
            res.cookie('user','admin',{signed: true});
            next();
      }
      else{
            var err = new Error('You are not authenticated!');
            res.setHeader('WWW-Authenticate','Basic');
            err.status = 401;
            next(err);
      }
            

      }
      else{
            if(req.signedCookies.user==='admin')
            {
                  next();
            }
            else{
                  res.setHeader('WWW-Authenticate','Basic');
                  err.status = 401;
                  next(err);
            }
      }
}
app.use(auth);
app.use(express.static(__dirname+ '/public'));
app.use('/dishes',dishRouter);
app.use('/promotions',promoRouter);
app.use('/leaders',leaderRouter);
app.use((req,res,next) => {
      console.log(req.headers);
      res.statusCode = 200;
      res.setHeader('Content-Type','text/html');
      res.end('<html><body><h1>Hello World</h1></body></html>');
});
const server = http.createServer(app);
server.listen(port,hostname);