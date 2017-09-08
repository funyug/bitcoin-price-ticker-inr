var app = require('express')();
var http = require('http').Server(app);
var https = require('https');
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var zebpayBuyPrice = 0;
var zebpaySellPrice = 0;
var unocoinBuyPrice = 0;
var unocoinSellPrice = 0;
var coinsecureBuyPrice = 0;
var coinsecureSellPrice = 0;
var pocketBitsBuyPrice = 0;
var pocketBitsSellPrice = 0;
var usd_rate = 0;

var data = {
    unocoinBuyPrice : unocoinBuyPrice,
    unocoinSellPrice : unocoinSellPrice,
    zebpayBuyPrice : zebpayBuyPrice,
    zebpaySellPrice : zebpaySellPrice,
    coinsecureBuyPrice : coinsecureBuyPrice,
    coinsecureSellPrice : coinsecureSellPrice,
    pocketBitsBuyPrice : pocketBitsBuyPrice,
    pocketBitsSellPrice : pocketBitsSellPrice,
    usd_rate:usd_rate
};

var socket2 = io.of('/price');
socket2.on('connection', function(socket){
    console.log('a user connected');
    socket2.emit("price",data);
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


var getZebpayPrice = function() {
    var options = {
        host: 'api.zebpay.com',
        path: '/api/v1/ticker?currencyCode=INR',
        port: 443
    };

    var req = https.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            try {
                data = JSON.parse(data);
                zebpayBuyPrice = data.buy;
                zebpaySellPrice = data.sell;
            }
            catch(e) {
                return true;
            }
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
			console.log(data);
            try {
                data = JSON.parse(data);
                unocoinBuyPrice = data.buy;
                unocoinSellPrice = data.sell;
            }
            catch(e) {
                return true;
            }
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
            try {
                data = JSON.parse(data);
            }
            catch(e) {
                return true;
            }
            coinsecureBuyPrice = data.message.ask/100;
            coinsecureSellPrice = data.message.bid/100;
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
};

var getPocketBitsPrice = function() {
    var options = {
        host: 'www.pocketbits.in',
        path: '/Index/getBTCRate',
        port: 443
    };

    var req = https.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            try {
                data = JSON.parse(data);
                pocketBitsBuyPrice = data.BTC_BuyingRate;
                pocketBitsSellPrice = data.BTC_SellingRate;
            }
            catch(e) {
                return true;
            }
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
};

var priceUpdate = function() {
    getZebpayPrice();
    getCoinsecurePrice();
    getPocketBitsPrice();

    data = {
        unocoinBuyPrice : unocoinBuyPrice,
        unocoinSellPrice : unocoinSellPrice,
        zebpayBuyPrice : zebpayBuyPrice,
        zebpaySellPrice : zebpaySellPrice,
        coinsecureBuyPrice : coinsecureBuyPrice,
        coinsecureSellPrice : coinsecureSellPrice,
        pocketBitsBuyPrice : pocketBitsBuyPrice,
        pocketBitsSellPrice : pocketBitsSellPrice,
        usd_rate:usd_rate
    };

    socket2.emit("price",data);
};

var getCurrencyRate = function() {
    var options = {
        host: 'api.fixer.io',
        path: '/latest?base=USD',
        port: 443
    };

    var req = https.get(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (data) {
            try {
                data = JSON.parse(data);
                usd_rate = data.rates.INR;
            }
            catch(e) {
                return true;
            }
        });
    });

    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
};
getCurrencyRate();
priceUpdate();
setInterval(getCurrencyRate,21600000);
setInterval(priceUpdate,10000);

app.get('/bitcoin-price', function(req, res){
    res.json(data);
});


http.listen(3001, function(){
    console.log('listening on *:3001');
});