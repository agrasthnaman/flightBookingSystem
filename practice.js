const express = require('express');
const { check, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory database
let flights = [
  {
    origin: 'BOM',
    destination: 'AMD',
    flightDate: '2023-06-01',
    seats: ["1A", "1B", "1C", "1D", "1E", "1F", "2A", "2B", "2C", "2D", "2E", "2F", "3A", "3B", "3C", "3D", "3E", "3F", "4A", "4B", "4C", "4D", "4E", "4F", "5A", "5B", "5C", "5D", "5E", "5F", "6A", "6B", "6C", "6D", "6E", "6F", "7A", "7B", "7C", "7D", "7E", "7F", "8A", "8B", "8C", "8D", "8E", "8F", "9A", "9B", "9C", "9D", "9E", "9F", "10A", "10B", "10C", "10D", "10E", "10F", "11A", "11B", "11C", "11D", "11E", "11F", "12A", "12B", "12C", "12D", "12E", "12F", "13A", "13B", "13C", "13D", "13E", "13F", "14A", "14B", "14C", "14D", "14E", "14F", "15A", "15B", "15C", "15D", "15E", "15F", "16A", "16B", "16C", "16D", "16E", "16F", "17A", "17B", "17C", "17D", "17E", "17F", "18A", "18B", "18C", "18D", "18E", "18F", "19A", "19B", "19C", "19D", "19E", "19F", "20A", "20B", "20C", "20D", "20E", "20F", "21A", "21B", "21C", "21D", "21E", "21F"],
    seatPriceMap: [
      '1500',
      '500',
      '500',
      '500',
      '500',
      '1500',
      '1500',
      '1500',
      '1500',
      '1500',
      '1500',
      '1500',
      // ...
      '100',
      'Free',
      '200',
      '200',
      'Free',
      '100'
    ],
    basicFare: '5500'
  }
];

// Create a rate limiter middleware
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5 // 5 requests
});

// Available flights to be displayed
router.post('/details', [
  check('origin').isLength({ min: 3, max: 3 }),
  check('destination').isLength({ min: 3, max: 3 }),
  check('flightDate').isISO8601()
], limiter, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  const { origin, destination, flightDate } = req.body;
  const flight = flights.find(f =>
    f.origin === origin &&
    f.destination === destination &&
    f.flightDate === flightDate
  );

  if (!flight) {
    return res.status(404).json({ message: 'Flight not found' });
  }

  res.json(flight);
});

// Accept Passenger details and book flight
router.post("/book", auth, limiter, (req, res) => {
    // Get flight and passenger details from request body
    const { flightDetails, passengerDetails } = req.body;
  
    // Check if flight exists in memory
    const flightIndex = flights.findIndex(
      (f) =>
        f.origin === flightDetails.origin &&
        f.destination === flightDetails.destination &&
        f.flightDate === flightDetails.flightDate
    );
  
    if (flightIndex === -1) {
      return res.status(404).json({ message: "No flight available" });
    }
  
    const flight = flights[flightIndex];
  
    // Check if seats are available
    const availableSeats = flight.seats.filter(
      (s) => !flight.bookedSeats.includes(s)
    );
  
    if (availableSeats.length < passengerDetails.length) {
      return res.status(400).json({ message: "Seats not available" });
    }
  
    // Update booked seats in memory
    const bookedSeats = [];
    passengerDetails.forEach((p) => {
      bookedSeats.push(p.seat);
    });
    flight.bookedSeats.push(...bookedSeats);
  
    // Generate PNR and calculate total fare
    const pnr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const total = passengerDetails.reduce(
      (acc, p) => acc + flight.seatPriceMap[flight.seats.indexOf(p.seat)],
      0
    );
  
    // Return PNR and total fare
    return res.json({ pnr, total });
  });
  
  // GET /api/flight/retrieve
    // app.get('/api/flight/retrieve', limiter, (req, res) => {
        // TODO: Implement the flight retrieval endpoint
    // });

    router.get("/retrieve", auth, limiter, (req, res) => {
        // Get PNR and lastName from query parameters
        const { pnr, lastName } = req.query;
      
        // Check if flight exists in memory
        const flight = flights.find((f) => f.bookedSeats.includes(lastName));
      
        if (!flight) {
          return res.status(404).json({ message: "No flight available" });
        }
      
        // Get passenger details from booked seats
        const passengersDetails = flight.bookedSeats
          .filter((s) => s.lastName === lastName && s.pnr === pnr)
          .map((s) => {
            return {
              firstName: s.firstName,
              lastName: s.lastName,
              seat: s.seat,
            };
          });
      
        // Return PNR, flight details, and passenger details
        return res.json({
            firstName: s.firstName,
              lastName: s.lastName,
              seat: s.seat,
        });
    }
    );
    
    // Define the auth endpoint
    // app.get('/api/auth', limiter, (req, res) => {
    //     // TODO: Implement the auth endpoint
    // });
    
    // Generate Swagger documentation
    const swaggerDocument = require('./swagger.json');
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    
    // Start the server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Flight Booking System listening on port ${port}`);
    });
