const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion } = require('mongodb');
/* const res = require('express/lib/response'); 
const { configDotenv } = require('dotenv'); */
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

    const usersColletion = client.db("productSP").collection("users");
    const productColletion = client.db("productSP").collection("product");
    const productCategoryColletion = client.db("productSP").collection("productCategory");
    const cabColletion = client.db("productSP").collection("cabs");
    
    //users api
    app.post('/users', async(req, res) =>{
      const user = req.body;
      const result = await cabColletion.insertOne(user);
      res.send(result);
    })


    app.get('/product', async(req, res) =>{
        const result = await productColletion.find().toArray();
        res.send(result);
    })

    app.get('/productCategory', async(req, res) =>{
        const result = await productCategoryColletion.find().toArray();
        res.send(result);
    })

/* Cab Data Collection api for cab button in navBar */
    app.get('/cabs', async(req, res) => {
        const email = req.query.email;
        
        if(!email){
          res.send([]);         
        }

        const query = {email: email};
        const result = await cabColletion.find(query).toArray();
        res.send(result);
    });


/* Cab Data Collection For next page */
    app.post('/cabs', async(req, res) =>{
      const item = req.body;
      const result = await cabColletion.insertOne(item);
      res.send(result);
    })

    app.delete('/cabs/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cabColletion.deleteOne(query);
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

/* 
*------------------------
     NAMING CONVENBTION
-------------------------
users : userCollection]

app.get('/users')
app.get('/users/:id')
app.post('/users')
app.patch('/users/:id')
app.put('/users/:id')
app.delete('/users/:id')

*/