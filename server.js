var express = require('express');
var bodyParser = require('body-parser');
var apiRouter =require('./apiRouter').router

var server =express()

//Body-Parser argument et params pour requête http
server.use(bodyParser.urlencoded({extended: true}));
server.use(bodyParser.json());

// configure routes
server.get('/', function (req, res) {
    res.setHeader('Content-Type','text/html') //en-tete server
    res.status(200).send('<h1>Bonjour server</h1>')
});

//ROUTER API
server.use('/api/', apiRouter);

// PORT 8099 (u`liser le port disponible de votre choix)
server.listen(3500,function(){  
     console.log('Server en écoute')
    })