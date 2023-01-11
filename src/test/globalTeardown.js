const config = require('./config');

module.exports = async () => {
  if (config.Memory) {
    // Config to decided if an mongodb-memory-server instance should be used
    const instance = global.__MONGOINSTANCE;
    await instance.stop();
  }
};
