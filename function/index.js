const fs = require("fs");
const MongoClient = require("mongodb").MongoClient;

async function getConnection(){
    // Get mongodb user & pass from secrets
    const username = fs.readFileSync('/secrets/mongodb-credentials/username', 'utf8');
    const password = fs.readFileSync('/secrets/mongodb-credentials/password', 'utf8');
    
    // Construct uri
    const uri = "mongodb+srv://" + username + ":" + password  + "@faasdemo-uiuxc.mongodb.net/faasdemodb?retryWrites=true";
    
    // Get mongodb connection
    return MongoClient.connect(uri, { useNewUrlParser: true });
}

function getProductCollection(client){
    return client.db("faasdemodb").collection("products");   
}

async function createProduct(client, product){
    return getProductCollection(client).insertOne(product);
}

async function getAllProducts(client){
    return getProductCollection(client).find({}).toArray();
}


module.exports.handler = async (event, context) => { 
    var req = event.extensions.request;
    var res = event.extensions.response;
    
    // Allow cross origin requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    
    // No caching
    res.setHeader("Cache-Control", "no-cache");
    
    // Get a connection, holding the thread until the promise is resolved
    await getConnection().then(async function(client){
        // Connection established, process request according to method
        if(req.method === "GET") {
            // Get all products
            await getAllProducts(client).then(function(aProducts){
                res.status(200).json(aProducts); 
            });
        } else if(req.method === "POST"){
            // Create a product
            await createProduct(client, JSON.parse(req.body.toString())).then(function(response){
                res.status(201).json({
                    productId: response.insertedId
                });
            });
        } else {
            // Other methods not implemented
            res.status(501).json({
                errorMessage: "Method not implemented"
            });
        }
    }).catch(function(err){
        // Error occurred
        res.status(500).send(err);
    });
}