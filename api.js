const express = require('express');
const rateLimit = require("express-rate-limit");
const { dbConnectAvailableFlights, dbConnectBookings } = require('./mongodb');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 requests
    message: "Too many requests, please try again later."
  });
const increaseLimit = (req, res, next) => {
    limiter.max += 1; // increase the max limit by 1
    next();
};
const jwt = require('jsonwebtoken');

function generateAccessToken(user) {
  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email
  };
  const options = {
    expiresIn: '1h'
  };
  const secret = 'my-secret-key';

  return jwt.sign(payload, secret, options);
}
app.get('/api/auth', (req, res) => {
    // verify the user's credentials and generate an access token
    const expiresIn = 3599; // expiration time in seconds
    const token = generateAccessToken(); // function to generate access token
    res.json({ expires: expiresIn, token: token });
});

app.get('/api/flight/retrieve', increaseLimit, limiter, async (req, resp) =>{
    //http://localhost:5000/retrieve?pnr=A1B23C&lastName=XYZ
    const { pnr, lastName } = req.query;
    console.log({ pnr, lastName });

    //Retrieve passenger and flight details with given PNR and lastName of passenger
    let bookingPnr = pnr;
    let bookingData  =await dbConnectBookings();
    bookingData  = await bookingData.find({pnr : bookingPnr}).toArray();
    // bookingData  = await bookingData.find({pnr : bookingPnr}).toArray();
    resp.send(bookingData)
});


app.post('/api/flight/book', increaseLimit, limiter, async (req, resp) => {
    
    let bookDetails = req.body;
    
    let flightData  = await dbConnectAvailableFlights();
    let bookingData  =await dbConnectBookings();
    flightData  = await flightData.find().toArray();
    
    const seats = flightData[0].seats;
    const seatPriceMap = flightData[0].seatPriceMap;
    const passengerDetails = bookDetails.passengerDetails;
    const newPnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    bookDetails.pnr = newPnr;
    let totalCost = 0;
    // console.log({seats, seatPriceMap, newPnr})
    for (const passenger of passengerDetails) {
        if (seats.includes(passenger.seat)) {
            const seatIndex = seats.indexOf(passenger.seat);
            totalCost += seatPriceMap[seatIndex];
        }
    }
    bookDetails.total = totalCost;
    bookDetails.pnr = newPnr;
    console.log(bookDetails);
    try{
        let result = await bookingData.insertOne(bookDetails);
    } catch (err) {
        // Handle errors
        console.error(err);
        resp.status(500).send('Error inserting document into collection');
      }
    resp.send({pnr: newPnr, total: totalCost});
})



app.post('/api/flight/details', increaseLimit, limiter, async (req, res) => {
    try {
        const { origin, destination, flightDate } = req.body;
  
        let flightData  = await dbConnectAvailableFlights();
        flightData  = await flightData.find().toArray();
        console.log({ origin, destination, flightDate });
        let ftDate = new Date(flightDate);
        const isoDate = ftDate.toISOString().slice(0,10) + 'T00:00:00Z';
        flightData  = await flightData.find({ origin: origin, destination : destination, flightDate: isoDate }).toArray();

        // If no matching flights found
        if (!flightData) {
        return res.status(404).json({ message: 'No flights found' });
        }

        // Return flight details in response
        return res.json(flightData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Server error' });
    }
  });

app.listen(5000)