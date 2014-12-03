var timingModel = require('../models/timing');

module.exports = function(req, res) {
    var covarianceMatrixInverse = req.body.covarianceMatrixInverse,
        word = req.body.word,
        userId = req.body.userId;
    
    if (! userId || !covarianceMatrixInverse  || ! word) {
        if (!userId) {
            return res.send(400, {error: "userId required"});
        }
        return res.send(400);
    }

    timingModel.upsertById({userId: userId, word: word}, {$set : {covarianceMatrixInverse: covarianceMatrixInverse}}, function(err, result) {
        res.send(err ? 400 : 200);
    });
};
