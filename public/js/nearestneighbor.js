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
    // Finds both Euclidean and Mahalanobis distance between the sampleVector and all the training vectors in vectorArray
    var ranges = findRanges(vectorArray);
    var distances = new Array(vectorArray.length);

    for (var vectorIndex in vectorArray) {
        var sum = 0;
        for (var featureIndex = 0; featureIndex < ranges.length; featureIndex++) {
            // euclidean distance
            var delta = vectorArray[vectorIndex][featureIndex] - sampleVector[featureIndex];
            delta = Math.pow(delta / ranges[featureIndex], 2); // normalize
            sum += delta;
        }
        distances[vectorIndex] = { 
            euc: Math.sqrt(sum),
            mahal : mahalDistNormalized(covarianceMatrixInverse, ranges, vectorArray[vectorIndex], sampleVector)
        };
    }

    // sort the resultant array by mahalanobis distance
    return _.sortBy(distances, function(d) {
        return d.mahal;
    });
}


function calculateThresholdNN(vectorArray, covarianceMatrixInverse, toleranceFactor) {
    var maxDist = 0;
    var localMax;
    var array;
    for (var i = 0; i < vectorArray.length; i++) {
        // since we're finding the furthest distance, it's okay to leave this vector in the array
        // if you were finding the nearest neighbor, you must splice this array out or else you'll get 0 distance (distance to self)
        localMax = _.last(getSortedNeighborDistances(vectorArray[i], vectorArray, covarianceMatrixInverse)).mahal;
        if (localMax > maxDist) {
            maxDist = localMax;
        }
    }
    return maxDist * toleranceFactor;
}
