function createCovarianceMatrixInverse(timingVectorMatrix) {
    var transposed = transpose(timingVectorMatrix); // input matrix has columns as rows -- need other way
    var n = transposed.length,
        S = new Array(n);
    for (var i = 0; i < n; i++) {
        // create n*n matrix from m*n input matrix (m = number of rows, n = number of cols)
        S[i] = new Array(n);
    }
    for (var i = 0; i < n; i++) {
        S[i][i] = variance(transposed[i]);
        for (var j = i + 1; j < n; j++) {
            S[i][j] = covariance(transposed[i], transposed[j]);
            S[j][i] = S[i][j]; // variance values are reflected across top left - bottom right diagonal
        }
    }
    return matrix_invert(S);
}

function mahalDist(covarianceMatrixInverse, meanVector, testVector) {
    // mahalDist = sqrt (Transpose(testVector - meanVector) * Inverse Covariance * (sampleVector - Mean Vector))
    // We need a columnar matrix for the "transpose difference" (left) matrix,
    // and a row matrix for the regular "difference". This is a cheap trick to get them.
    var differenceTranspose = [difference(testVector, meanVector)], // need a columnar matrix 
        differenceVector = transpose(differenceTranspose); // need a row matrix

    var mahalanobisDistanceSquared = multiplyMatrices(multiplyMatrices(differenceTranspose, covarianceMatrixInverse), differenceVector);
    return Math.sqrt(mahalanobisDistanceSquared[0][0]);} // result is a one-item two dimensional array

function classifyVector(mahalanobisDistance, threshold) {
    return mahalanobisDistance <= 10 * threshold.range + threshold.max; 
}

function mahalDistNormalized(covarianceMatrixInverse, ranges, meanVector, testVector, holdOrFlight, weight) {
    // same as mahalDist, but normalize the values of the timing data to be between -1 and 1 when computing distance
    // if you want weighting for hold times, pass holdOrFlight = 'hold'
    // for flight, pass 'flight'
    var indexes;
    if (holdOrFlight) {
        indexes = holdOrFlight === 'hold' ? 0 : 1;
    }
    weight = weight || 1;

    var differenceTranspose = [normalizedDifference(testVector, meanVector, ranges)]; // need a columnar matrix 
        differenceTranspose[0] = _.map(differenceTranspose[0], function(v, i) {
            if (holdOrFlight && (i % 2 === indexes)) {
                return v * weight;             
            }
            return v;
        });
    var differenceVector = transpose(differenceTranspose); // need a row matrix

    var mahalanobisDistanceSquared = multiplyMatrices(multiplyMatrices(differenceTranspose, covarianceMatrixInverse), differenceVector);
    return Math.sqrt(mahalanobisDistanceSquared[0][0]); // result is a one-item two dimensional array
}

function classifyVector(mahalanobisDistance, threshold) {
    return mahalanobisDistance <= 10 * threshold.range + threshold.max; 
}

function calculateThreshold(covarianceInverse, meanVector, vectorArray) {
    var distances = _.map(vectorArray, function(v) {
        var mahal = mahalDist(covarianceInverse, meanVector, v);
        return mahal;
    });
    return {max: _.max(distances), range: _.max(distances) - _.min(distances)};
}

function variance(vector) {
    var v = 0;
    for (var i = 0; i < vector.length; i++) {
        v += Math.pow((vector[i] - mean(vector)), 2);
    }
    v = v / vector.length;
    return v;
}

function covariance(a, b) {
    // https://github.com/bytespider/covariance
    // Compute the covariance between vectors a and b
    var length = a.length;
    var i = 0;

    var mean_a = mean(a);
    var mean_b = mean(b);
    var values = [];

    for ( ; i < length; i += 1) {
        var diff_a = a[i] - mean_a;
        var diff_b = b[i] - mean_b;
        values.push(diff_a * diff_b);
    }

    return mean(values);
}
