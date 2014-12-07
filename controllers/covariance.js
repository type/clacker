var timingModel = require('../models/timing');

module.exports = function(req, res) {
    var covarianceMatrixInverse = req.body.covarianceMatrixInverse,
        trainingVectors = req.body.trainingVectors,
        word = req.body.word,
        userId = req.body.userId;
    
    if (! userId || !covarianceMatrixInverse  || ! word || ! trainingVectors) {
        if (!userId) {
            return res.send(400, {error: "userId required"});
        }
        return res.send(400);
    }

    timingModel.upsertById({userId: userId, word: word}, {$set : {covarianceMatrixInverse: covarianceMatrixInverse, trainingVectors: trainingVectors}}, function(err, result) {
        res.send(err ? 400 : 200);
    });
};
