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
const emitLogs = ({exchangeName='', channel, connection, msg=''}) => {
  // create non-default exchange
  channel.assertExchange(exchangeName, 'fanout', {
    durable: false
  });
  // publish to a temporary queue
  channel.publish(exchangeName, '', Buffer.from(msg));
  console.log("[x] Sent %s", msg);
  setTimeout(()=>{
    connection.close();
    process.exit(0);
  }, 500);
}
(async()=>{
  try {
    const connection = await createConnection();
    const channel = await createChannel(connection);
    const msg = process.argv.slice(2).join(' ') || 'Hello World';
    emitLogs({exchangeName: 'logs', channel, connection, msg});
  } catch(error) {
    console.log('error', error);
  }
})();