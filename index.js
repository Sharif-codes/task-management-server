const express = require('express');
const app = express()
require('dotenv').config()
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.port || 5000

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.db_user}:${process.env.db_pass}@task-management.e91tehb.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        const usersCollection = client.db('taskManagement').collection('users')
        const taskssCollection = client.db('taskManagement').collection('tasks')

        app.post('/addUser', async (req, res) => {
            const user = req.body
            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query)
            if (existingUser) {
                return res.send({ message: "Already have a user with this email", insertedId: null })
            }
            const result = await usersCollection.insertOne(user)
            res.send(result)
        })
        app.post('/addTask', async (req,res)=>{
            const tasks= req.body
            const result= await taskssCollection.insertOne(tasks)
            res.send(result)
        })
        app.get('/tasks/:email', async(req,res)=>{
            const email= req.params.email
            const query= {user: email}
            const data= await taskssCollection.find(query).toArray()
            res.send(data)
        })
        app.put("/updateTask/:id",async (req,res)=>{
            const id= req.params.id
            const status= req.body.status
           
            const filter={_id: new ObjectId(id)} 
            const document={
                $set:{
                    status: `${status}`
                }
            }
            const result= await taskssCollection.updateOne(filter,document)
            res.send(result)
        })
        app.delete("/deleteTask/:id", async (req,res)=>{
            const id= req.params.id
            const query= {_id: new ObjectId(id)}
            const result= await taskssCollection.deleteOne(query)
            res.send(result)
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);
app.get('/', (req, res) => {
    res.send('Hello from Task management..')
})

app.listen(port, () => {
    console.log(`Task management is running on port ${port}`)
})
