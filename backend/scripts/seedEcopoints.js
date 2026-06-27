const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('../src/config/db');
const EcoPoint = require('../src/models/EcoPoint');

const seedData = [
  {
    name: 'Ecoponto Central',
    address: 'Rua Venancio Neiva, 123 - Centro, Campina Grande, PB',
    lat: -7.2301,
    lng: -35.8816,
    categories: ['Plástico', 'Papel', 'Metal'],
  },
  {
    name: 'Ecoponto Bodocongo',
    address: 'Avenida Marechal Floriano, 456 - Bodocongo, Campina Grande, PB',
    lat: -7.218,
    lng: -35.9012,
    categories: ['Vidro', 'Metal'],
  },
  {
    name: 'Ponto Verde Universitario',
    address: 'Rua Aprigio Veloso, 882 - Universitario, Campina Grande, PB',
    lat: -7.2156,
    lng: -35.9078,
    categories: ['Plástico', 'Papel'],
  },
  {
    name: 'Ecoponto Malvinas',
    address: 'Avenida Portugal, 789 - Malvinas, Campina Grande, PB',
    lat: -7.2445,
    lng: -35.8923,
    categories: ['Metal', 'Vidro', 'Plástico'],
  },
  {
    name: 'Coleta Seletiva Centro',
    address: 'Rua Maciel Pinheiro, 234 - Centro, Campina Grande, PB',
    lat: -7.2189,
    lng: -35.8801,
    categories: ['Papel', 'Plástico'],
  },
];

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  await connectDB(process.env.MONGODB_URI);

  const operations = seedData.map((point) => ({
    updateOne: {
      filter: { name: point.name },
      update: {
        $set: {
          name: point.name,
          address: point.address,
          categories: point.categories,
          active: true,
          location: {
            type: 'Point',
            coordinates: [point.lng, point.lat],
          },
        },
      },
      upsert: true,
    },
  }));

  const result = await EcoPoint.bulkWrite(operations);
  console.log('EcoPoints seed completed:', {
    inserted: result.upsertedCount,
    modified: result.modifiedCount,
  });
}

seed()
  .catch((error) => {
    console.error('EcoPoints seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
  });
