var fs = require('fs');
const http = require("http")
const https = require("https")
const express = require('express')
const app = express()
const httpRedirect = express()

httpRedirect.get('*', function(req, res) {  
  res.redirect('https://' + req.headers.host + req.url);
})

var privateKey  = fs.readFileSync('/etc/letsencrypt/live/blindrefinement.com/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/blindrefinement.com/fullchain.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};

var httpServer = http.createServer(httpRedirect);
var httpsServer = https.createServer(credentials, app);
const io = require('socket.io')(httpsServer);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

cards = []
cardCounter = 0

io.on('connection', (socket) => {
  socket.emit('cards',cards)
  socket.on('elementupdate', msg => {
    console.log(msg)
    cards[msg.element.replace("dynamic","")] = msg.value
    io.emit('elementupdate', msg);
  });
  socket.on('newCard', msg => {
    console.log("newCard")
    io.emit('newCard', cardCounter);
    cards[cardCounter++] = ""
  });
});

/*app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})*/


httpServer.listen(3000);
httpsServer.listen(8443);

