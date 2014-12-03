var collectionName = 'timing',
    db = require('./db'); 

exports.upsertById = function(query, updateQuery, callback) {
    db.withCollection(collectionName, function(err, collection) {
        collection.update(query, updateQuery, {upsert: true}, function(err, res) {
            return callback(err, res);
        });
    });
};

exports.findOne = function(query, callback) {
    db.withCollection(collectionName, function(err, collection) {
        collection.findOne(query, {_id: 0}, function(err, results) {
            if (err || !results) {
                return callback(err || 'No Results');
            }
            callback(err, results);
        });
    });
}

