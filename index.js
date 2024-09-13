const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.SK_User}:${process.env.SK_Pass}@cluster0.xu7sm0d.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("productSP").collection("users");
    const productCollection = client.db("productSP").collection("product"); // Corrected the variable name
    const productCategoryCollection = client
      .db("productSP")
      .collection("productCategory");
    const cabCollection = client.db("productSP").collection("cabs");

    // Users API
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    // Admin API
    app.patch("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      const result = { admin: user?.role === "admin" };
      res.send(result);
    });

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // Delete Users From Database
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Product API
    app.get("/product", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    app.post("/product", async (req, res) => {
      try {
        const newItem = req.body;
        console.log("Received new product data:", newItem); // Logging the received data
        const result = await productCollection.insertOne(newItem);
        res.send(result);
      } catch (error) {
        console.error("Failed to add product:", error); // Logging the error
        res.status(500).send({ message: "Failed to add product", error });
      }
    });

    // Product Category API
    app.get("/productCategory", async (req, res) => {
      const result = await productCategoryCollection.find().toArray();
      res.send(result);
    });

    // Cab Data Collection API for cab button in navBar
    app.get("/cabs", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }

      const query = { email: email };
      const result = await cabCollection.find(query).toArray();
      res.send(result);
    });

    // Cab Data Collection For next page
    app.post("/cabs", async (req, res) => {
      const item = req.body;
      const result = await cabCollection.insertOne(item);
      res.send(result);
    });

    app.delete("/cabs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cabCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("ARA Fash Electronic Zone is sitting!");
});

app.listen(port, () => {
  console.log(`ARA Fash Electronic Zone is setting ${port}`);
});

/* 
*------------------------
     NAMING CONVENTION
-------------------------
users : userCollection

app.get('/users')
app.get('/users/:id')
app.post('/users')
app.patch('/users/:id')
app.put('/users/:id')
app.delete('/users/:id')

*/
