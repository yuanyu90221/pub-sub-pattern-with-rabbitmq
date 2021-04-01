// amqp client library
const amqp = require('amqplib/callback_api');
/**
 * @description createConnection
 * @returns connection
 */
const createConnection = async () => {
  return new Promise((resolve, reject) => {
    amqp.connect('amqp://json:rabbitmq@127.0.0.1', (error, connection) => {
      if (error) {
        return reject(error);
      } else {
        resolve(connection);
      }
    });
  });
};
const createChannel = async (connection) => {
  return new Promise((resolve, reject) => {
    connection.createChannel((error, channel) => {
      if (error) {
        reject(error);
      } else {
        resolve(channel);
      }
    });
  })
};
const createQueueAndExchange = ({exchangeName='', channel}) => {
  return new Promise((resolve, reject) =>{
    // create non-default exchange
    channel.assertExchange(exchangeName, 'fanout', {
      durable: false
    });
    // create a temporary queue
    channel.assertQueue('', {
      exclusive: true
    }, (error, queue)=> {
      if (error) {
        reject(error);
      } else {
        resolve(queue);
      }
    })
  })
};
const receiveMsg = ({q, exchangeName='', channel})=> {
  console.log("[*] Waiting for messages in %s, To exit press Ctrl+C", q.queue);
  // bind relation for queue and exchange 
  channel.bindQueue(q.queue, exchangeName, '');
  channel.consume(q.queue, (msg)=> {
    if (msg.content) {
      console.log("[X] %s", msg.content.toString());
    }
  }, {
    noAck: true
  })
}
(async()=>{
  try {
    const connection = await createConnection();
    const channel = await createChannel(connection);
    const q = await createQueueAndExchange({exchangeName: 'logs', channel});
    receiveMsg({q, exchangeName:'logs', channel});
  } catch(error) {
    console.log('error', error);
  }
})();