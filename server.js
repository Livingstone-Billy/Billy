const express = require('express');

const app = express();

const bodyParser = require('body-parser');

// const path = require('path');

var MongoClient = require('mongodb').MongoClient;

const bcrypt = require('bcrypt');

var port = 8080;

var url = "mongodb://localhost:27017/newdb";

app.get('/',(req,res)=>{
    res.set({
        'Access-Control-Allow-Origin' : '*'
    });
    return res.redirect('/public/index.html')
}).listen(port,()=>{
    console.log(`Server is listening on port ${port}`);
});

app.use('/public',express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
}));

app.post('/signup',(req,res)=>{
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var email = req.body.email;
    var pass = req.body.password;
    
    var data = {
        "first_name": firstname,
        "second_name": lastname,
        "email":email
    };
    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        console.log("Database Connected!");
        const saltRounds = 10;
        bcrypt.genSalt(saltRounds,function(err,salt){
            if(err) throw err;
            bcrypt.hash(pass,salt,function(err,hash){
                if(err) throw err;
                console.log(hash);
                data["password"] = hash;
                var dbo = db.db("newdb");
                dbo.collection("details").insertOne(data,function(err,result){
                    if(err) throw err;
                    console.log("Records added successfully");
                    console.log(result);
                });
            });
        });
    });

    console.log('DATA is' + JSON.stringify(data));
    res.set({
        'Access-Control-Allow-Origin' : '*'
    });
    console.log(req.body.firstname+" has signed up successfully");
    res.redirect('/public/login.html');
});

app.post('/login',function(req,res){
    var log_email = req.body.log_email;
    var password = req.body.log_pass;

    MongoClient.connect(url,function(err,db){
        if(err) throw err;
        var dbo = db.db("newdb");
        var user = dbo.collection("details").findOne({email:log_email});
        if(user){
            var validPassword = bcrypt.compare(password,data.password);
            if(validPassword){
                res.send("Log in successful");
            }else{
                res.send("Invalid email or password");
            }
        }
    });
});