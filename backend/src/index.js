const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/db');
const app = require('./app');

const REQUIRED_ENV = ['MONGODB_URI', 'JWT_SECRET'];

for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    throw new Error(`${key} is required`);
  }
}

const port = Number(process.env.PORT || 3000);

connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => {
      console.log(`EcoScan API running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start EcoScan API:', error.message);
    process.exit(1);
  });
