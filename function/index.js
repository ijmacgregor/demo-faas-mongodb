const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;

const MongoUtil = { 
    getConnection : async () => {
        // Get mongodb user & pass from secrets
        const username = fs.readFileSync('/secrets/mongodb-credentials/username', 'utf8'),
                password = fs.readFileSync('/secrets/mongodb-credentials/password', 'utf8');
        
        // Construct uri
        const uri = "mongodb+srv://" + username + ":" + password  + "@faasdemo-uiuxc.mongodb.net/faasdemodb?retryWrites=true";
        
        // Get mongodb connection
        return MongoClient.connect(uri, { useNewUrlParser: true });
    },

    // Gets the products collection in DB faasdemodb
    getCollection: client => client.db("faasdemodb").collection("products"),

    // Creates a product in collection products
    createProduct: async (product) => {
        return await MongoUtil.getConnection().then(async client => {
            return await MongoUtil.getCollection(client).insertOne(product);
        });
    },

    // Gets all records in collection products
    getProducts: async () => {
        return await MongoUtil.getConnection().then(async client => {
            return await MongoUtil.getCollection(client).find({}).toArray();
        });
    }
};

module.exports.handler = async (event, context) => {  
    var request = event.extensions.request;
    var response = event.extensions.response;
    
    // Allow cross origin requests
    response.setHeader("Access-Control-Allow-Origin", "*");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST");
    
    // No caching
    response.setHeader("Cache-Control", "no-cache");
    
    // Process depending on request method
    switch(request.method){
        case "POST":
            // Create product 
            await MongoUtil.createProduct(JSON.parse(request.body.toString())).then(data => {
                // Product created, return 201 success code and the created record id
                response.status(201).json({
                    productId: data.insertedId
                });
            });
            break;
        case "GET":
            // Get all products
            await MongoUtil.getProducts().then(products => {
                // Products retrieved, return 200 success code and the json product array
                response.status(200).json(products);
            });
            break;
        default:
            // Invalid method, return error
            response.status(501).json({
                errorMessage: "Method not implemented"
            });
    }
}