const express = require('express')
const cors = require('cors');
const app = express()
const port = 5000
require('dotenv').config();

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");

    const database = client.db(process.env.AUTH_DB_NAME);
    const productsCollection = database.collection("products");
    const usersCollection = database.collection("user");

   
    app.get('/', (req, res) => {
      res.send('ReSell Hub API is running!');
    });

    // Products API
    app.get('/api/products', async (req, res) => {
      try {
        const products = await productsCollection.find({}).toArray();
        res.status(200).json({
          success: true,
          data: products
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch products",
          error: error.message
        });
      }
    });

    //Users API
    app.get('/api/users', async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        res.status(200).json({
          success: true,
          data: users
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: "Failed to fetch users",
          error: error.message
        });
      }
    });

 
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);