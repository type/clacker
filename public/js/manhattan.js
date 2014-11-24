function manhattanDistance(meanVector, testVector) {
    if (meanVector.length !== testVector.length) {
        return false;
    }
    var manhattanDist = 0;
    for (var i = 0; i < meanVector.length; i++) {
        manhattanDist += Math.abs(meanVector[i] - testVector[i]);
    }
    return manhattanDist;
}
