const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.SK_User}:${process.env.SK_Pass}@cluster0.xu7sm0d.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productColletion = client.db("productSP").collection("product");
    const productCategoryColletion = client.db("productSP").collection("productCategory");
    
    app.get('/product', async(req, res) =>{
        const result = await productColletion.find().toArray();
        res.send(result);
    })

    app.get('/productCategory', async(req, res) =>{
        const result = await productCategoryColletion.find().toArray();
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();



  }
}
run().catch(console.dir);

app.get('/', (req, res) =>{
    res.send('shop task running')
})

app.listen(port, () => {
    console.log(`Shop is setting ${port}`)
})