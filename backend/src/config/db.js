const mongoose = require('mongoose');

async function connectDB(uri) {
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== 'production',
  });
}

module.exports = { connectDB };
