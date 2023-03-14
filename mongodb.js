const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Database Name
const dbName = 'flightBooking';


async function dbConnectAvailableFlights(){
    let result = await client.connect();
    let db = result.db(dbName);
    return db.collection('availableFlights')
    // let response = await availableFlights.find({}).toArray();
    // console.log(response); 
}

async function dbConnectBookings(){
    let result = await client.connect();
    let db = result.db(dbName);
    return db.collection('bookings')
    // let response = await availableFlights.find({}).toArray();
    // console.log(response); 
}
dbConnectAvailableFlights();

module.exports = { dbConnectAvailableFlights, dbConnectBookings };