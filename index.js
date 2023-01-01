const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();

//middelware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bu53v7d.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    try {

        const usersCollection = client.db('creativeitDemo').collection('userCollection');

        app.post('/users', async (req, res) => {
            const user = req.body
            const userQuery = { email: req.body.email }
            const usernameQuery = { username: req.body.username }
            const storedUser = await usersCollection.findOne(userQuery);
            if (storedUser) {
                const message2 = "User already exists";
                return res.send({ acknowledged: false, message2 })
            }
            const storedUsername = await usersCollection.findOne(usernameQuery);
            if (storedUsername) {
                const message = "Username already exists";
                return res.send({ acknowledged: false, message })
            }
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (!user) {
                const message = "Wrong Email/Password";
                return res.send({ acknowledged: false, message })
            }
            res.send(user);
        })

    }
    finally {

    }

}
run().catch(console.log)


app.get('/', async (req, res) => {
    res.send('creativeit demo server running')
})
app.listen(port, () => console.log(`creative it demo running on port ${port}`))