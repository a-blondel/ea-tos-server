var minimist = require('minimist');
var net = require('net');
var tls = require('tls');
var fs = require('fs');

var server;
var port;
var args = minimist(process.argv.slice(2));

var handleSocketData = function(socket) {
    socket.on('data', function(data) {
        var req = data.toString();
        if (req.indexOf('/legalapp') !== -1) {
            fs.readFile('tosa.en.txt', 'utf8', function(err, data) {
                if (err) {
                    socket.write('HTTP/1.1 500 Internal Server Error\r\n');
                    socket.write('Content-Type: text/plain\r\n');
                    socket.write('\r\n');
                    socket.write('Server error');
                    socket.end();
                } else {
                    socket.write('HTTP/1.1 200 OK\r\n');
                    socket.write('Content-Type: text/html;charset=UTF-8\r\n');
                    socket.write('\r\n');
                    socket.write(data);
                    socket.end();
                }
            });
        } else {
            socket.write('HTTP/1.1 404 Not Found\r\n');
            socket.write('Content-Type: text/plain\r\n');
            socket.write('\r\n');
            socket.write('Not Found');
            socket.end();
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
