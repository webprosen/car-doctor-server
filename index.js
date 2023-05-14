const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewire
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ww5yfzh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const serviceCollection = client.db('car_doctor').collection('services');
    const bookingCollection = client.db('car-doctor').collection('bookings');

    app.get('/', (req, res)=>{
        res.send('Server is running...');
    });

    app.get('/services', async (req, res)=>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    });

    app.get('/services/:id', async (req, res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const options = {
            projection: {title:1, price: 1, service_id:1, img:1}
        };

        const result = await serviceCollection.findOne(query, options);
        res.send(result);
    });

    // Bookings
    app.get('/bookings', async (req, res) => {
        console.log(req.query);
        let query = {};
        if(req.query?.email){
            query = {email: req.query.email}
        }
        const result = await bookingCollection.find().toArray();
        res.send(result);
    });

    app.post('/booking', async (req, res) => {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
    });

    app.patch('/bookings/:id', async (req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updateBooking = req.body;

        const updateDoc = {
            $set: {
                status: updateBooking.status
            }
        }
        const result = await bookingCollection.updateOne(filter, updateDoc);
        res.send(result);
    });

    app.delete('/bookings/:id', async (req, res) => {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await bookingCollection.deleteOne(query);
        res.send(result)
    });




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
});