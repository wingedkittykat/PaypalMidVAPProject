var fs = require('fs')
const express = require('express');
const session = require('express-session');
var app = express();
var path = require('path')
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 

app.set('views', './views');
app.set('view engine', 'pug');

var ses;
var studName='';
var profName='';

function readFile(filename) {
    let promise = new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf-8', (err, data) => {
            if (err) { return reject(new Error(err)); }
            resolve(JSON.parse(data));
        });
    });
    return promise
}

app.get('/addcourse',function(req,res){
    res.sendFile(path.join(__dirname, 'add.html'))
})

app.get('/addcourseSub',function(req,res){
    readFile(path.join(__dirname,'files','courses.JSON'))
        .then((data) =>{
            data.push({
                id: req.query.id,
                name: req.query.name,
                Prof: profName,
                students:[]
            })
            return(JSON.stringify(data))
        })
        .then((data)=>{
            fs.writeFile(path.join(__dirname,'files','courses.JSON'),data,function(err){
                if(err){
                    console.log("Error in writing file")
                }
                console.log("File written")
            })
        })
        .then((data)=>{
            res.redirect('/infoProf')
        })
})

app.get('/studentLogin',function(req,res){
    readFile(path.join(__dirname,'files','student.JSON'))
        .then((data)=>{
            flag = true
            // console.log(data)
            data.forEach(i=>{
                console.log(req.query.username);
                if(i.username==req.query.username && i.password==req.query.password){
                    studName = i.username;
                    flag = false;
                    res.redirect('/info');
                }
            })
            return(flag)
        })
        .then((flag)=>{
            if(flag){
                console.log("Wrong username or password");
                res.render('errormsg',{
                    msg: "Wrong username or password",
                    btnmsg: "Try again"
                })
            }
        })
})

app.get('/profLogin',function(req,res){
    readFile(path.join(__dirname,'files','prof.JSON'))
        .then((data)=>{
            flag = true
            data.forEach(i=>{
                if(i.username==req.query.username1 && i.password==req.query.password1){
                    profName = i.username;
                    flag = false;
                    res.redirect('/infoProf');
                }
            })
            if(flag){
                console.log("Wrong username or password");
                res.render('errormsg',{
                    msg: "Wrong username or password",
                    btnmsg: "Try again"
                })
            }
        })
})

enrolled = []
course = []
app.get('/info',function(req,res){
    enrolled = []
    course = []
    readFile(path.join(__dirname,'files','courses.JSON'))
        .then((data)=>{
            data.forEach(i=>{
                flag = true
                i.students.forEach(j=>{
                    if(j==studName){
                        enrolled.push([i.name,i.Prof])
                        flag = false
                    }
                })   
                if(flag){
                    course.push([i.name,i.Prof])
                }  
            })
            return(enrolled)
        })
        .then((data)=>{
            credits = 0;
            readFile(path.join(__dirname,'files','student.JSON'))
                .then((stud)=>{
                    stud.forEach(i=>{
                        if(i.username==studName){
                            credits = i.credits;
                        }
                    })
                    return(credits)
                })
                .then((cred)=>{
                    res.render('info',{
                        creds: cred,
                        enroll: data
                })
            })
        })
})

app.get('/choose',function(req,res){
    res.render('choose',{
        courses: course
    })
})

app.get('/chooseSub',function(req,res){
    var query = JSON.parse(req.query.chooseCourse)
    var choice = {
        prof: query[1],
        id: query[0]
    }
    // console.log(choice.chooseCourse)
    readFile(path.join(__dirname,'files','courses.JSON'))
        .then((data)=>{
            // console.log(data)
            data.forEach(i=>{
                if(choice.prof==i.Prof && choice.id==i.name){
                    i.students.push(studName)
                }  
            })
            return(JSON.stringify(data))
        })
        .then((data)=>{
            fs.writeFile(path.join(__dirname,'files','courses.JSON'),data,function(err){
                if(err){
                    console.log("Error in writing file")
                }
                console.log("File written")
            })
        })
        .then((data)=>{
            res.redirect('/info')
        })
})

profDisp = []
app.get('/infoProf',function(req,res){
    profDisp=[]
    readFile(path.join(__dirname,'files','courses.JSON'))
        .then((data)=>{
            data.forEach(i=>{
                if(i.Prof==profName){
                    profDisp.push([i.name,i.students])
                }
            })
            return(profDisp)
        })
        .then((data)=>{
            // console.log(profDisp)
            res.render('infoProf',{
                disp: profDisp
            })
        })
})

app.get('/',function(req,res){
    res.sendFile(path.join(__dirname, 'login.html'))
})

app.listen(8030)
