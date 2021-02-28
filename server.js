
const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const clientSessions = require("client-sessions");
const fs = require("fs");
const http = require("http");
const https = require("https");
const HTTP_PORT = process.env.PORT || 8080;
const HTTPS_PORT = 4433;
const ASSETS = "./assets/";
const SSL_KEY_FILE = ASSETS + "server.key";
const SSL_CRT_FILE = ASSETS + "server.crt";
const nodemailer = require("nodemailer");
const https_options = {
    key: fs.readFileSync(__dirname + "/" + SSL_KEY_FILE),
    cert: fs.readFileSync(__dirname + "/" + SSL_CRT_FILE)
};

require ('./controllers/connection.js');
app.engine('.hbs', exphbs({ extname: '.hbs',
defaultLayout: 'main',
layoutsDir: path.join(__dirname, 'views/layouts'),
partialsDir: __dirname + '/views/partials'
 }));
app.set('view engine', '.hbs');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('static'));
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "smonajemi", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));
  

//routing
app.get('/',(req,res) => {
    res.render('index',{title: 'Sina Monajemi'});
});


app.post('/', (req, res,next) => {
     
    const fname = req.body.first_name;
    const lname = req.body.last_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const message = req.body.message;
    const data = fname && lname && email && phone && message;

    if(data === ""){
        return res.render("partials/contact.hbs", { errorMsg: "Please fill out the required fields to submit :)", title: 'Contact Me'})
        
    }  

//Contact Button    
setTimeout(() => {

var admin = `contactsinamon@gmail.com`;
var date = new Date();
const fullname = (req.body.first_name + " " + req.body.last_name).toUpperCase();
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'contactsinamon@gmail.com',
            pass: 'qrqiuzxtzkrllmeb'
        },
        tls:{
            rejectUnauthorized: false
        }
});
    
    const emailAdmin = {
        from: req.body.email,
        to: admin,
        subject: `${fullname}`,
        html: `<h3>NEW MESSAGE FROM <a style="color:red;">${fullname}</a>: </h3><br>
                            
                <b><p><a style="color:red;"> "</a> ${req.body.message} <a style="color:red;"> "</a> </b>  <br><hr><br><i>${fullname} <br> ${req.body.phone}<br>
                ${req.body.email}</i></p> <br><br> ${date}`
    }    

    const emailSender = {
        from: req.body.email,
        to: req.body.email,
        subject: `Thank You`,
        html: `<h4>Hi ${req.body.first_name},<br><br> Your message has been sent successfully. I will get back to you as soon as possible.<br><br>Talk soon,<br>Sina Monajemi</h4><br><br>
        <h2>Your Message:</h2> <br> ${req.body.message} <br><br><hr><br> ${date}`
    } 

    const mailOption = [emailAdmin, emailSender];
    var i = 1;
    console.log(fullname);
    mailOption.forEach(e => {             
        transporter.sendMail(e, (err) => {
            var flag = Boolean(false);
            while(!flag){   
                if(err){
                    console.log(`EMAIL COULD NOT BE SENT - ${err}`);
                    flag = false;
                    break;
                }else{
                    console.log( `Email ${i} sent successully.`);    
                    flag = true;
                }
            }
            if(i == 2){
                if(flag == false){                    
                    res.send(`<h3>Oops... Error Sending Email!</h3><hr><br> <h5>${err}</h5>`);
                }else{
                    res.redirect('/finalPage');   
                    exit = true;
            }
                    }
        i++;
        });    
    });  
         
}, 2 * 1000);
});

// Final Page
app.get("/finalPage",  (req,res) => {
    if(exit == true){
        res.render('finalPage',{title: 'THANK YOU!'});
    } else {
        res.redirect('/')
    }
    exit = false;
})

// Download Button
app.get('/downloadResume', (req, res) => {
    res.download(__dirname + '/static/sinamonajemi.pdf', 'sinamonajemi.pdf')
  })

app.get("*", (req,res) => {
    res.render('error',{title: 'PAGE NOT FOUND'});
})

http.createServer(app).listen(HTTP_PORT, onHttpStart);
https.createServer(https_options, app).listen(HTTPS_PORT, onHttpsStart);

function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
function onHttpsStart() {
    console.log("Express https server listening on: " + HTTPS_PORT);
}