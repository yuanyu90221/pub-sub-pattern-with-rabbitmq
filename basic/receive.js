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
const receiveMessage = ({queueName='', channel}) => {
  channel.assertQueue(queueName, {
    durable: false
  });
  console.log('[*] Waiting for messages in %s, To exit press Ctrl+C', queueName);
  channel.consume(queueName, (msg)=>{
    console.log("[*] Received %s", msg.content.toString());
  }, {noAck: true});
}
(async()=>{
  try {
    const connection = await createConnection();
    const channel = await createChannel(connection);
    receiveMessage({queueName: 'hello', channel});
  } catch(error) {
    console.log('error', error);
  }
})();