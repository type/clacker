var collectionName = 'timing',
    db = require('./db'); 

exports.upsertById = function(userId, word, timingVector, callback) {
    db.withCollection(collectionName, function(err, collection) {
        // keep 100 newest items in the timingVectors for this user x word comobo, update it if possible, otherwise create it
        collection.update({userId: userId, word: word}, {$push: {timingVectors: { $each: [timingVector],  $slice: -100}}}, {upsert: true}, function(err, res) {
            return callback(err, res);
        });
    });
};

exports.findByUserAndWord = function(userId, word, callback) {
    db.withCollection(collectionName, function(err, collection) {
        collection.findOne({userId: userId, word: word}, {_id: 0}, callback);
    });
}

