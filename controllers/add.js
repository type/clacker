var timingModel = require('../models/timing');

module.exports = function(req, res) {
    var timingVector = req.body.timingVector,
        word = req.body.word,
        userId = req.body.userId;

    if (! userId || !Array.isArray(timingVector) || ! word) {
        return res.send(400);
    }

    timingModel.upsertById(userId, word, timingVector, function(err, result) {
        res.send(err ? 400 : 200);
    });
};
