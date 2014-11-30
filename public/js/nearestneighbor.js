function findRanges(vectorArray) {
    // get max and min value for each feature
    var ranges = new Array(vectorArray[0].length),
        min,
        max;

    for (var i = 0; i < ranges.length; i++) {
        min =  _.reduce(vectorArray, function(memo, v) {
            return v[i] < memo ? v[i] : memo;
        }, 10000000);
        max = _.reduce(vectorArray, function(memo, v) {
            return v[i] > memo ? v[i] : memo;
        }, 0);
        ranges[i] = max - min;
    }
    return ranges;
}

function getSortedNeighborDistances(sampleVector, vectorArray, covarianceMatrixInverse) {
    // find how far this sample is from all the others
    // problem right now is vector array contains this element still - need to remove it somehow
    var ranges = findRanges(vectorArray);
    var distances = new Array(vectorArray.length);
    for (var vectorIndex in vectorArray) {
        var sum = 0;
        for (var i = 0; i < ranges.length; i++) {
            // normalize the data
            var delta = vectorArray[vectorIndex][i] - sampleVector[i];
            delta = Math.pow(delta / ranges[i], 2);
            sum += delta;
        }
        distances[vectorIndex] = { 
            euc: Math.sqrt(sum),
            mahal : mahalDistNormalized(covarianceMatrixInverse, ranges, vectorArray[vectorIndex], sampleVector)
        };
    }

    return distances;
}
