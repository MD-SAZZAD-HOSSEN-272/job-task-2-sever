const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URL;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const jobsCollection = client.db('Job_task').collection('jobs')

    app.post("/jobs", async (req, res) => {
      req.body.postedBy = req.body.postedBy || "Sazzad";
      req.body.date = new Date()
    //   console.log(req.body);
      const result = await jobsCollection.insertOne(req.body)
      res.send(result)
    });

    app.get('/jobs', async(req, res) => {
        const result = await jobsCollection.find().toArray();
        res.send(result)
    })


    app.get('/my_jobs', async(req, res) => {
        const {email} = req.query;
        const query = {posterEmail: email}
        const result = await jobsCollection.find(query).toArray();
        res.send(result)
        // console.log(email);
    })

    app.get('/my_jobs/:id', async(req, res) => {
        const {id} = req.params;
        const query = {_id: new ObjectId(id)}
        const result = await jobsCollection.findOne(query)
        res.send(result)
    })

    app.delete('/my_jobs', async(req, res) => {
        const {id} = req.body;
        const query = {_id: new ObjectId(id)}
        const result = await jobsCollection.deleteOne(query);
        res.send(result)

    })

    app.patch('/update_jobs/:id', async(req, res) => {
        const data = req.body;
        const {id} = req.params;
        const query = {_id: new ObjectId(id)}
        data.postedBy = data.postedBy || 'Sazzad'
        const updateDoc = {
            $set: data
        }
        const result = await jobsCollection.updateOne(query, updateDoc)
        res.send(result)
        
    })



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
  res.send("this server is running");
});

app.listen(port, () => {
  console.log("this server run on port :", port);
});
