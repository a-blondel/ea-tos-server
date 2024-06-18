var minimist = require('minimist');
var net = require('net');
var tls = require('tls');
var fs = require('fs');
var querystring = require("querystring");
var handleAc = require("./nwc/handleAc");
var utils = require("./nwc/utils");

var server;
var port;
var args = minimist(process.argv.slice(2));

var handleSocketData = function(socket) {
    var data = '';
    socket.on('data', function (chunk) {
        data += chunk;
        var separator = '\r\n\r\n';
        var endIndex = data.indexOf(separator);
        if (endIndex === -1) {
            // The entire header has not been received yet. Wait for more data.
            return;
        }
        var requestText = data.substring(0, endIndex);
        var remainingData = data.substring(endIndex + separator.length);
        var lines = requestText.split('\r\n');
        var headers = {};
        var body = '';
        var i = 0;
        while (i < lines.length && lines[i] !== '') {
            var header = lines[i].split(': ');
            headers[header[0].toLowerCase()] = header[1];
            i++;
        }
        if (headers['content-length']) {
            var expectedBodyLength = parseInt(headers['content-length'], 10);
            if (remainingData.length < expectedBodyLength) {
                // The entire body has not been received yet. Wait for more data.
                return;
            }
            var body = remainingData.substring(0, expectedBodyLength);
            data = remainingData.substring(expectedBodyLength);
        }

        var request = {
            method: lines[0].split(' ')[0].toUpperCase(),
            url: lines[0].split(' ')[1],
            httpVersion: lines[0].split(' ')[2],
            headers: headers,
            body: querystring.parse(body + data),
        };

        if (request.method && request.url) {
            console.log("--- Request from " + socket.remoteAddress + " ---\r\n", request, "\r\n\r\n");
            if (request.method === "POST" && request.url === "/ac") {
                handleAc(socket, request);
            } else if (request.method === "GET" && request.url.indexOf('/legalapp') !== -1) {
                fs.readFile('tosa.en.txt', 'utf8', function(err, data) {
                    if (err) {
                        utils.sendHttpResponse(socket, "500 Internal Server Error", "Internal Server Error");
                    } else {
                        utils.sendHttpResponse(socket, "200 OK", data);
                    }
                });
            } else {
                utils.sendHttpResponse(socket, "404 Not Found", "Not Found");
            }
        } else {
            utils.sendHttpResponse(socket, "404 Not Found", "Not Found");
        }
    });
};

if (args.mode === 'https') {
    var options = {
        key: fs.readFileSync('./certs/tos.key.pem'),
        cert: fs.readFileSync('./certs/tos.cert.pem'),
        secureProtocol: 'SSLv3_method',
        ciphers: 'RC4-MD5:RC4-SHA'
    };
    server = tls.createServer(options, handleSocketData);
    port = 443;
} else {
    server = net.createServer(handleSocketData);
    port = 80;
}

server.listen(port, function() {
    console.log('Server listening on port ' + port);
});
