const express = require('express');
const dbConnectBookings = require("./mongodb")
const dbConnectAvailableFlights = require("./mongodb")
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5 // 5 requests
  });

// app.use(express.bodyParser())
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

app.get('/api/flight/retrieve',limiter, async (req, resp) =>{
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


app.post('/api/flight/book', limiter, async (req, resp) => {
    
    let bookDetails = req.body;
    
    let flightData  = await dbConnectAvailableFlights();
    flightData  = await flightData.find().toArray();
    
    const seats = flightData.seats;
    const seatPriceMap = flightData.seatPriceMap;
    const passengerDetails = bookDetails.passengerDetails;
    const newPnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    bookDetails.pnr = newPnr;
    let totalCost = 0;
    console.log({seats, seatPriceMap})
    // for (const passenger of passengerDetails) {
    //     if (seats.includes(passenger.seat)) {
    //         const seatIndex = seats.indexOf(passenger.seat);
    //         totalCost += seatPriceMap[seatIndex];
    //     }
    // }
    console.log(flightData);
    // console.log(numberOfPassenger);
    resp.send({"name": "naman"});
    // let result = await insert(req.body);
})





app.listen(5000)