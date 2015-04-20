var WebSocketServer = require('websocket').server;
var http = require('http');
var roooms = {};
var messagefor = {};
var signal;
var clients = {};
var connection;
var temp_connection;
var count=0;
var count2=0;


var server = http.createServer(function(request, response) {
    /*
    response.write(page);
    response.end();
    */
});

/*
var fs = require('fs');

var page = undefined;
fs.readFile("start_2.html", function(error, data) {
    if (error) {
        console.log(error);
    } else {
        page = data;
    }
});
*/

server.listen(4999, function() {
  console.log((new Date()) + " Server is listening on port 4999");
});

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

function sendCallback(err) {
    if (err) console.error("send() error: " + err);
}

// This callback function is called every time someone
// tries to connect to the WebSocket server
wsServer.on('request', function(request) {
    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');
    connection = request.accept(null, request.origin);
    console.log(' Connection ---->' + connection.remoteAddress);
    clients[count] = connection;
    clients[count].send(JSON.stringify({"id" : count,
                                       "type": "id"}));
    count++;
    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("--------------------------recibiendo mensaje--------------------------");
            console.log("caso llave no creada aun");
            try {
                signal = JSON.parse(message.utf8Data);
            }
            catch(e) {
                console.log(e.message);
            }
            /*
            if (signal["id"]==0){
                clients[1].send(JSON.stringify(signal));
            }
            else if (signal["id"]==1){
                clients[0].send(JSON.stringify(signal));
            }*/
            if (signal["key"]) {
                if (roooms[signal["key"]]==undefined) {
                    console.log("caso llave no creada aun");
                    var room = {};
                    conn_list = {};
                    conn_list["instructor"]=clients[signal["id"]]
                    room["status"] = "waiting";
                    room["connection"] = conn_list;
                    roooms[signal["key"]]=room;
                    clients[signal["id"]].send(JSON.stringify({"instructor":true,
                                                               "type":"confirmation",
                                                               "id":"instructor"}));
                }
                else if (roooms[signal["key"]]["status"]=="waiting"){
                    console.log("caso esperando");
                    signal["destination"] = signal["id"];
                    roooms[signal["key"]]["connection"][signal["id"]] = clients[signal["id"]];
                    roooms[signal["key"]]["status"] = "connected";
                    for (var i in roooms[signal["key"]]["connection"]){
                        roooms[signal["key"]]["connection"][i].send(JSON.stringify(signal));
                    }
                }    
                else if (roooms[signal["key"]]["status"] === "connected"){
                    if (roooms[signal["key"]]["connection"][signal["id"]]==undefined){
                        console.log("caso ya conectado nuevo peer");
                        signal["destination"] = signal["id"];
                        roooms[signal["key"]]["connection"][signal["id"]]=clients[signal["id"]];
                        roooms[signal["key"]]["connection"]["instructor"].send(JSON.stringify(signal));
                        roooms[signal["key"]]["connection"][signal["id"]].send(JSON.stringify(signal));
                    }
                    else{
                        console.log("caso ya conectado peers existentes");
                        if (signal["id"] == "instructor"){
                            console.log("enviando al cliente");
                            roooms[signal["key"]]["connection"][signal["destination"]].send(JSON.stringify(signal));   
                        }
                        else if (signal["id"] != "instructor"){
                            console.log("enviado al instructor");
                            roooms[signal["key"]]["connection"]["instructor"].send(JSON.stringify(signal));
                        }
                    }
                }
            }
        }
    });
    
    connection.on('close', function(connection){
        // close user connection
        console.log((new Date()) + " Peer disconnected.");        
    });
});

function SendMessage(message, connection){
    roooms[signal["key"]]["connection"].forEach(function (outputConnection) {
        console.log(outputConnection.remoteAddress);
        if(outputConnection != connection){
            outputConnection.send(JSON.stringify(message), sendCallback);
        }
    }); 
}