var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

var socket2 = io.of('/test');
socket2.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

var zebpayBuyPrice = 0;
var zebpaySellPrice = 0;
var unocoinBuyPrice = 0;
var unocoinSellPrice = 0;
var coinsecureBuyPrice = 0;
var coinsecureSellPrice = 0;

var getZebpayPrice = function() {
    var options = {
        host: 'api.zebpay.com',
        path: '/api/v1/ticker?currencyCode=INR',
        port: 443
    };

    var req = https.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            data = JSON.parse(data);
            zebpayBuyPrice = data.buy;
            zebpaySellPrice = data.sell;
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
};

var getUnocoinPrice = function() {
    var options = {
        host: 'www.unocoin.com',
        path: '/trade?all',
        port: 443
    };

    var req = https.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            data = JSON.parse(data);
            unocoinBuyPrice = data.buy;
            unocoinSellPrice = data.sell;
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
};

var getCoinsecurePrice = function() {
    var options = {
        host: 'api.coinsecure.in',
        path: '/v1/exchange/ticker',
        port: 443
    };

    var req = https.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            data = JSON.parse(data);
            coinsecureBuyPrice = data.message.ask;
            coinsecureSellPrice = data.message.bid;
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
};

var priceUpdate = function() {
    getZebpayPrice();
    getUnocoinPrice();
    getCoinsecurePrice();

    var data = {
        unocoinBuyPrice : unocoinBuyPrice,
        unocoinSellPrice : unocoinSellPrice,
        zebpayBuyPrice : zebpayBuyPrice,
        zebpaySellPrice : zebpaySellPrice,
        coinsecureBuyPrice : coinsecureBuyPrice,
        coinsecureSellPrice : coinsecureSellPrice
    };

    socket2.emit("price",data);
};

setInterval(priceUpdate,20000);


http.listen(3000, function(){
    console.log('listening on *:3000');
});