const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
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

        //Register and  Storing user data with validation
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

            //password encryption
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(user.password, salt);


            const newUser = {
                username: user.username,
                email: user.email,
                password: passwordHash,
            }
            const result = await usersCollection.insertOne(newUser);
            res.send(result);
        })

        // Loging IN and compare hash password with the password with validation
        app.post('/user', async (req, res) => {
            const { email, password } = req.body
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (!user) {
                const message = "Wrong Email/Password";
                return res.send({ acknowledged: false, message })
            }

            //Comparing hash password with the password
            const isMatch = await bcrypt.compare(password, user.password);
            console.log(isMatch);
            if (!isMatch) {
                const message2 = "Invalid credentials";
                return res.send({ acknowledged: false, message2 })
            }

            res.send({ acknowledged: true, success: "User found" })
        })

        //Getting a specific user data by email 
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email
            const filter = { email: email }
            const result = await usersCollection.findOne(filter);
            res.send(result);
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