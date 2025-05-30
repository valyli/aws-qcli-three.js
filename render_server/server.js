var exec = require('child_process').exec,
    express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    fs = require('fs'),
    getPixels = require("get-pixels"),
    args = process.argv.slice(2),
    fifo = fs.createWriteStream(args[0]),
    width = args[1].split('x')[0], height = args[1].split('x')[1],
    cmdOpenChrome = 'open -a "Google Chrome" http://localhost:3000?size='+args[1];

// 添加调试日志
console.log('Starting render server with size:', args[1]);
console.log('FIFO path:', args[0]);
console.log('Serving static files from: /Users/valyli/lj/pub-git/aws-qcli-three.js/three-js-demo');

// 设置Socket.IO的CORS选项
io.set('origins', '*:*');

// 设置静态文件目录
app.use("/", express.static('/Users/valyli/lj/pub-git/aws-qcli-three.js/three-js-demo'));

// 添加Socket.IO的客户端库
app.get('/socket.io/socket.io.js', function(req, res) {
    res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
});

http.listen(3000, function(){
    console.log('Server listening on port 3000');
    
    exec(cmdOpenChrome, function(error, stdout, stderr) {
        if (error) {
            console.error('Error opening Chrome:', error);
            return;
        }
        
        console.log('Chrome launched successfully');
        
        io.on('connection', function(socket){
            console.log('Client connected');

            socket.on('greetings', function(data){
                console.log('Received greetings from client');
                socket.emit('nextFrame', true);
            });

            socket.on('newFrame', function(frame){
                console.log('Received new frame from client');
                
                getPixels(frame.png, function(err, pixels) {
                    if(err) {
                        console.log("Error - image invalid:", err);
                        socket.emit('nextFrame', true); // 即使出错也请求下一帧
                        return;
                    }
                    
                    console.log('Processing frame, size:', pixels.shape);
                    
                    fifo.write(Buffer.from(pixels.data), function(writeErr){ 
                        if (writeErr) {
                            console.error('Error writing to FIFO:', writeErr);
                        } else {
                            console.log('Frame written to FIFO');
                        }
                        
                        socket.emit('nextFrame', true); 
                    });
                });
            });

            socket.on('disconnect', function(msg){
                console.log("Client disconnected, shutting down.");
                process.exit();
            });
        });
    });
});
