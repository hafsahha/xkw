import { MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGO_URI) { throw new Error("MONGO_URI is not defined in environment variables") }

const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

export default db = client.connect()
    .then(connectedClient => {
        console.log("Connected to MongoDB");
        return connectedClient.db("dbX");
    })
    .catch(error => {
        console.error("DB Connection Error:", error);
        return null;
    });
