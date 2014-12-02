var async = require("async"),
    _ = require('underscore'),
    MongoClient = require('mongodb').MongoClient;


dbConnection = exports.dbConnection = async.memoize(function(callback) {
    // Application has not yet connected to mongo
    var connectionString = 'mongodb://localhost:27017/clacker'

    MongoClient.connect(connectionString, function(err, db) {
        if (err) {
            console.log("Could not connect to mongo! Exiting!");
            process.exit(1);
        }
        else {
            dbConn = db;
            callback(db);
        }
    });
});


exports.withCollection = function(collectionName, callback) {
    dbConnection(function(db) {
        if (! db) {
            var e = new Error("Can't connect to MongoDB");
            return callback(e, null);
        }
        else {
            db.collection(collectionName, function(err, collection) {
                return callback(err, collection);
            });
        }
    });
};
