const MongoClient = require('mongodb').MongoClient;

// Get mongodb user & pass from secrets
const uri = "mongodb+srv://dbuser:rYd7wXaLhrLJJgUU@faasdemo-uiuxc.mongodb.net/faasdemodb?retryWrites=true";

MongoClient.connect(uri, { useNewUrlParser: true }).then(function(client){
   console.log('Connected to mongodb');

   const collection = client.db("faasdemodb").collection("products");

   collection.insertOne({ productId: "1234" }).then(function(o){
      console.log("Successfully created product with id %s.",o.insertedId);
      client.close();
   }).catch(function(err){
      console.error("Failed to create product");
      client.close();
   });

}).catch(function(err){
   console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
});
