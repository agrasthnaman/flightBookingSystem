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