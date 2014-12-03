var timingModel = require('../models/timing');

module.exports = function(req, res) {
    var timingVector = req.body.timingVector,
        word = req.body.word,
        userId = req.body.userId;

    console.log(req.body);

    if (! userId || !Array.isArray(timingVector) || ! word) {
        return res.send(400);
    }

    timingModel.upsertById({userId: userId, word: word}, {$push: {timingVectors: { $each: [timingVector],  $slice: -100}}}, function(err, result) {
        res.send(err ? 400 : 200);
    });
};
