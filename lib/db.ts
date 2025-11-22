import { MongoClient, ServerApiVersion, Db } from "mongodb";

if (!process.env.MONGO_URI) { throw new Error("MONGO_URI is not defined in environment variables") }

const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
});

const db: Promise<Db> = client.connect()
    .then(connectedClient => {
        console.log("Connected to MongoDB");
        return connectedClient.db("twitter_clone");
    })
    .catch(error => {
        console.error("DB Connection Error:", error);
        return null;
    });

export default db;
