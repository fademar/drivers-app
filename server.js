const express = require('express');
const amqplib = require('amqplib');
const http = require('http'); 
const cors = require('cors')

const app = express();
const server = http.Server(app);
const io = require('socket.io')(server);

const AMQP_URL = process.env.AMQP_URL || 'amqp://guest:guest@localhost:5672';
const EXCHANGE = 'drivers';
const ROUTING_KEY = 'drivers.update';
const QUEUE = 'update_drivers';

let conn;
let channel;

/**
 * Set the port of the server
 */
app.set('port', (process.env.PORT || 3001));


/**
 * Get data from the RabbitMQ producer
 * @param {Object} socket 
 */
async function getData(socket) {
    conn = await amqplib.connect(AMQP_URL);
    
    // Closing the connection if the socket client disconnects
    socket.on('disconnect', () => {
        console.log('client disconnected');
        conn.close();
    });

    channel = await conn.createChannel();
    await channel.assertExchange(EXCHANGE, 'topic', {durable: false});
    await channel.assertQueue(QUEUE, {durable: false});
    await channel.bindQueue(QUEUE, EXCHANGE, ROUTING_KEY);
    await channel.consume(QUEUE, function(msg) {
        socket.emit('drivers_update', JSON.parse(msg.content.toString()));
    }, {noAck: true});
}


/**
 * Set io origins for CORS 
 */
io.origins('*:*');

/**
 * Emit the data with SocketIO
 */
io.on('connection', (socket) => {  
  console.log('a client connected');
  getData(socket);
});


server.listen(app.get('port'), () => {
    console.log(`App running at http://localhost:${app.get('port')}/`);
});
