function euclideanDistance(meanVector, testVector) {
    if (meanVector.length !== testVector.length) {
        return 0;
    }
    var squaredDist = 0;
    for (var i = 0; i < meanVector.length; i++) {
        squaredDist += Math.pow(meanVector[i] - testVector[i], 2);
    }
    return Math.sqrt(squaredDist);
}
