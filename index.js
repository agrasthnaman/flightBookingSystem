const express = require('express');
const swaggerUi = require('swagger-ui-dist');
const app = express();

app.use('/docs', express.static(swaggerUi.getAbsoluteFSPath()));
app.get('/docs', (req, res) => {
    res.sendFile(swaggerUi.getAbsoluteFSPath('index.html'));
});
const { dbConnectAvailableFlights, dbConnectBookings } = require('./mongodb');

const main  = async () =>{
    let flightData  = await dbConnectAvailableFlights();
    let bookingData  = await dbConnectBookings();
    flightData  = await flightData.find().toArray();
    bookingData  = await bookingData.find().toArray();
    console.warn(flightData);
    console.warn(bookingData);
}

main();