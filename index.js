const express = require('express')
const path = require('path')
const cors = require("cors")
const corsOptions = {origin: "*"}
const PORT = process.env.PORT || 5000
var app = express();
app.use(cors(corsOptions));
var request = require('request');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
const socketio = require("socket.io");
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('pages/index'));

app.post('/2', (req, res) => res.render('pages/index'));

app.get('/signin', (req, res) => res.render('pages/signin'));

app.get('/signup', (req, res) => res.render('pages/signup'));

app.post('/about', (req, res) => {
    res.render('pages/about', {
		layout: 'main',
        title: 'About Me',
        style:  'about.css',
        description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus, eligendi eius! Qui'
    });
});

app.post('/add', (req, res) => {
    let inputText = [];
    inputText.push(req.body.userInput)
    res.render('pages/index', {
        inputText,
    });
});

//login authentication
app.post('/logins', function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    if(username && password){ 
        connection.query('SELECT username,password FROM logindetails WHERE username = ? AND password = ?',[username,password], function(error,results,fields){
            if(results.length > 0){
                req.session.loggedin = true;
                req.session.username = username;
                res.redirect('/users');
            } else{
                res.send('Incorrect username and password');
            }
            res.end();
        });
    }
     else{
         res.send('Please enter username and password');
         res.end();
     }
  });

app.post("/reg1", function(req,res){
  
   
    // const axios = require('axios');
         const email = req.body.email;
         const password = req.body.password;
     
         var request = require('request');
         var options = {
           'method': 'POST',
           'url': 'https://thpoint0backend.herokuapp.com/api/auth/signinaa',
           'headers': {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({
             "email": email,
             "password": password
           })
         
         };
         request(options, function (error, response) {
         //  if (error) throw new Error(error);
         //  console.log(response.body);

           if (error) {
             var script = true;
             res.render('registration', 
             { data: "Something Has Gone Wrong",
         Script: script
         });
             console.log(JSON.parse(error))
           }
           else {
             const myJSON = response.body;
             const obj = JSON.parse(myJSON);
             if(obj.hasOwnProperty('message')){
              //  const obj = JSON.parse(myJSON);
                 var data45 = obj.message;
                 var script = true;

             }else{
                 var data45 = obj.id;
                 var script = false;
                // obj.id = session.accesstoken;
                 session=req.session;
                 session.accessToken=obj.accessToken;
             };
               res.render('pages/index', 
               {data: data45,
             Script: script});
              console.log(response)
           }
         });             
 });

app.get('/new'), function(req, res, next) {
    const message = req.body.content // not sure if this is even correct
    console.log(message)
   
    res.render('pages/about') // something like res.render('poems', { message: I_should_put_a_correct_vaiarable_name_here }) should probably happen here
  }

 app.post('/about1', (req, res) => {
    res.render('pages/about', {
		layout: 'main',
        title: 'About Me',
        style:  'about.css',
        description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus, eligendi eius! Qui'
    });
});

app.post('/login', function(req,res){
    res.render('pages/abouts', {
		//layout: 'main',
        title: 'About Me',
        style:  'about.css',
        description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Temporibus, eligendi eius! Qui'
    });
 });
/*
 
const server = app.listen(
    PORT,
    console.log(
      `Server is runnig on ${process.env.NODE_ENV} mode at port ${PORT}`.yellow
        
    )
  );
  */

 const io = socketio();
 io.on("connection", function (socket) {
   console.log("a user connected");
 
   socket.on("chat message", (message) => {
     console.log(message);
 
     const callapibot = async (projectId = process.env.PROJECT_ID) => {
       try {
         const sessionId = uuid.v4();
         const sessionClient = new dialogflow.SessionsClient({
           keyFilename: "./WebSpeechAIbot-41194528781e.json",
         });
         const sessionPath = sessionClient.projectAgentSessionPath(
           projectId,
           sessionId
         );
         const request = {
           session: sessionPath,
           queryInput: {
             text: {
               text: message,
               languageCode: "en-US",
             },
           },
         };
         const responses = await sessionClient.detectIntent(request);
 
         console.log("Detected intent");
         const result = responses[0].queryResult.fulfillmentText;
         socket.emit("bot reply", result);
         console.log(result);
         if (result.intent) {
           console.log(`  Intent: ${result.intent.displayName}`);
         } else {
           console.log(`  No intent matched.`);
         }
       } catch (error) {
         console.log(error);
       }
     };
 
     callapibot();
   });
 });
 

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
