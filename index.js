const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.POST || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3f7kxdk.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const db = client.db("bookHaven");
    const bookCollection = db.collection("allBooks");
    const userCollection = db.collection("userBooks");
    const userCommentCollection = db.collection('comment')
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.get("/all-books", async (req, res) => {
      const cursor = bookCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/latest-books", async (req, res) => {
      const cursor = bookCollection.find().sort({ _id: -1 }).limit(6);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/book-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookCollection.findOne(query);
      res.send(result);
    });

    app.get("/userbook-details/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.findOne(query);
      res.send(result);
    });

    app.get("/myBooks", async (req, res) => {
      const email = req.query.email;
      
      const query = {};
      if (email) {
        query.userEmail = email;
      }
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/add-book", async (req, res) => {
      const newProduct = req.body;
      const result = await userCollection.insertOne(newProduct);
      res.send(result);
    });

    //comments api
    app.post('/comment',async(req,res)=>{
      const NewComment = req.body;
      const result = await userCommentCollection.insertOne(NewComment)
      res.send(result)
    })

    app.get('/get-comment', async(req, res)=>{
      
      const cursor = userCommentCollection.find();
      const result = await cursor.toArray()
      res.send(result)
    })

    

    //  const updateInfo = {
    //   title,
    //   author,
    //   genre,
    //   rating,
    //   summary,
    //   image,
    //   userEmail,
    //   userName,
    // };

    app.patch("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateBook = req.body;
      console.log(updateBook);
      const update = {
        $set: {
          title: updateBook.title,
          author: updateBook.author,
          genre: updateBook.genre,
          rating: updateBook.rating,
          summary: updateBook.summary,
          coverImage: updateBook.image,
          userEmail: updateBook.userEmail,
          userName: updateBook.userName,
        },
      };

      const result = await userCollection.updateOne(query, update);
      res.send(result);
    });

    app.delete("/delete-book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("book haven server is activeed");
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});


