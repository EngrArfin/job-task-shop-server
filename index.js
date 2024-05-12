const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({ error: true, message: 'unauthorization access'});
  }
  //bearer token
  const token = authorization.split('') [1];
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if(err){
      return res.status(401).send({ error: true, message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next();
  })
}
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const { configDotenv } = require('dotenv');
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

    const usersCollection = client.db("productSP").collection("users");
    const productColletion = client.db("productSP").collection("product");
    const productCategoryColletion = client.db("productSP").collection("productCategory");
    const cabColletion = client.db("productSP").collection("cabs");


    app.post('/jwt',(req, res) =>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
      res.send({token})
    })

    //users api
    app.get('/users', async(req, res) =>{
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email }
      const existingUser = await usersCollection.findOne(query);

      if(existingUser){
        return res.send({message: 'user already exist'})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.patch('/users/admin/:id', async(req, res) => {
      const id =req.params.id; 
      const filter = {_id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    /* Delete Users From database */
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);

    })

    app.get('/product', async (req, res) => {
      const result = await productColletion.find().toArray();
      res.send(result);
    })

    app.get('/productCategory', async (req, res) => {
      const result = await productCategoryColletion.find().toArray();
      res.send(result);
    })

    /* Cab Data Collection api for cab button in navBar */
    app.get('/cabs', verifyJWT, async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }

      const decodedEmail = req.decoded.email;
      if(!email){
        return res.status(403).send({ error: true, message: 'forbided access'})
      }

      
      const query = { email: email };
      const result = await cabColletion.find(query).toArray();
      res.send(result);
    });

    /* Cab Data Collection For next page */
    app.post('/cabs', async (req, res) => {
      const item = req.body;
      const result = await cabColletion.insertOne(item);
      res.send(result);
    })

    app.delete('/cabs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
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

app.get('/', (req, res) => {
  res.send('Shop is sitting!')
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