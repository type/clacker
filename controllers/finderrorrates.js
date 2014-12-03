var timingModel = require('../models/timing'),
    async = require('async');

module.exports = function(req, res) {
    var authenticUserId = req.body.authenticUserId,
        imposterUserId = req.body.imposterUserId,
        word = req.body.word;
    
    async.parallel([
        function(cb) {
            timingModel.findOne({userId: authenticUserId, word: word}, cb)
        },
        function(cb) {
            timingModel.findOne({userId: imposterUserId, word: word}, cb)
        }], 
    function(err, results) {
        if (err) {
            return res.send(400);
        }
        return res.send({authentic: results[0], imposter: results[1]})
    });
}
