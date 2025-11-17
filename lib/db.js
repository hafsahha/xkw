const { MongoClient, ServerApiVersion } = require("mongodb");

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

const client = new MongoClient(process.env.MONGO_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let clientPromise = client.connect();

async function getDB(dbName) {
    try {
        const connectedClient = await clientPromise;
        console.log("Connected to MongoDB");
        return connectedClient.db(dbName);
    } catch (error) {
        console.error("DB Connection Error:", error);
        return null;
    }
}

export async function getCollection(collectionName) {
    const db = await getDB("dbX");
    if (db) return db.collection(collectionName);
    return null;
}