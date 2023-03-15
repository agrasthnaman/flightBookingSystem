const express = require('express');
const rateLimit = require("express-rate-limit");
const { dbConnectAvailableFlights, dbConnectBookings } = require('./mongodb');

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

const secretKey = 'mysecretkey';

const payload = {
  email: 'agrasthnaman.an.doe@example.com',
  role: 'user'
};

const options = {
  expiresIn: '1h'
};

const Stoken = jwt.sign(payload, secretKey, options);
// console.log(Stoken);

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, secretKey);
    req.userData = { email: decodedToken.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}


app.get('/api/flight/retrieve', authMiddleware, increaseLimit, limiter, async (req, resp) =>{
    //http://localhost:5000/retrieve?pnr=A1B23C&lastName=XYZ
    const { pnr, lastName } = req.query;

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
    for (const passenger of passengerDetails) {
        if (seats.includes(passenger.seat)) {
            const seatIndex = seats.indexOf(passenger.seat);
            totalCost += seatPriceMap[seatIndex];
        }
    }
    bookDetails.total = totalCost;
    bookDetails.pnr = newPnr;
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

  const { origin, destination, flightDate } = req.body;
  let flightData  = await dbConnectAvailableFlights();
  
  let ftDate = new Date(flightDate);
  const isoDate = ftDate.toISOString().slice(0,10) + 'T00:00:00Z';
  const result  = await flightData.find({origin: origin, destination: destination, flightDate: isoDate}).toArray();
  // const result  = await flightData.findOne(query, (err, result) => {
  //   if (err) {
  //     console.log(err);
  //     res.status(500).send('Error fetching flight details');
  //     return;
  //   }
    
    // Sending flight details in response
  //   res.status(200).send(result);
  // });
  
  if(result && result.length)
    res.status(200).send(result);
  else{
    res.status(500).send('Error fetching flight details');
  }
    
});

app.listen(5000)