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
        ranges[i] = max - min;  //explicit conversion to a number
    }
    return ranges;
}

function getSortedNeighborDistances(sampleVector, vectorArray, covarianceMatrixInverse) {
    // Finds both Euclidean and Mahalanobis distance between the sampleVector and all the training vectors in vectorArray
    sampleVector = sampleVector.map(Number);
    try {
        vectorArray = JSON.parse(vectorArray);
    }
    catch(ex) {
        vectorArray = vectorArray;
    }
    covarianceMatrixInverse = covarianceMatrixInverse.map(function(a) { return a.map(Number)});

    var ranges = findRanges(vectorArray);
    var distances = new Array(vectorArray.length);

    var mean = getMeanVector(vectorArray);

    for (var vectorIndex in vectorArray) {
        var sumNorm = 0;
        var sumHold = 0;
        var sumFlight = 0;
        for (var featureIndex = 0; featureIndex < ranges.length; featureIndex++) {
            // euclidean distance
            var delta, deltaHold, deltaFlight;
            delta = vectorArray[vectorIndex][featureIndex] - sampleVector[featureIndex];
            if (featureIndex % 2 === 1) {
                deltaFlight = delta * 5; 
            }
            else {
                deltaHold = delta * 5;
            }
            delta = Math.pow(delta / ranges[featureIndex], 2); // normalize
            deltaHold = Math.pow(deltaHold / ranges[featureIndex], 2); // normalize
            deltaFlight = Math.pow(deltaFlight / ranges[featureIndex], 2); // normalize
            sumNorm += delta;
            sumHold += deltaHold;
            sumFlight += deltaFlight;
        }
        distances[vectorIndex] = { 
            nnEuc: Math.sqrt(sumNorm),
            nnEucHold: Math.sqrt(sumHold),
            nnEucFlight: Math.sqrt(sumFlight),
            nnMahal : mahalDist(covarianceMatrixInverse, vectorArray[vectorIndex], sampleVector),
            nnMahalNormalized : mahalDistNormalized(covarianceMatrixInverse, ranges, vectorArray[vectorIndex], sampleVector),
            nnMahalNormalizedHold : mahalDistNormalized(covarianceMatrixInverse, ranges, vectorArray[vectorIndex], sampleVector, 'hold', 5),
            nnMahalNormalizedFlight : mahalDistNormalized(covarianceMatrixInverse, ranges, vectorArray[vectorIndex], sampleVector, 'flight', 5),
            euc: euclideanDistance(mean, vectorArray[vectorIndex]),
            manhattan: manhattanDistance(mean, vectorArray[vectorIndex])
        };
    }

    // sort the resultant array by mahalanobis distance
    return _.sortBy(distances, function(d) {
        return d.mahal;
    });
}


function calculateThresholdNN(vectorArray, covarianceMatrixInverse) {
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
    return maxDist * 1.1;
}

