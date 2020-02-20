var express = require('express');
var app = express();
app.use(express.json());
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded(
    {extended: false})
)

app.get('/',function(req,res){
    re
})