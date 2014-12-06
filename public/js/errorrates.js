function equalErrorRateNN(covarianceMatrixInverse, trainingVectors, authenticVectors, imposterVectors) {
    // what is the rate where the authentic user is rejected as often as an imposter is accepted?
    // we play with the threshold so that these two rates are the same, then find what the EER is.
    
    if (authenticVectors.length !== imposterVectors.length) {
        console.log("Must provide as many authentic samples as imposter samples");
        return;
    }
    var factor = 1000, // increments of .001 are nice
        eer,
        threshold;

    var authenticDistances = _.map(authenticVectors, function(a) {
        var distances = getSortedNeighborDistances(a, trainingVectors, covarianceMatrixInverse);
        console.log(_.map(distances, function(d){ return d.mahal}));
        return distances[5].mahal;// getSortedNeighborDistances(a, trainingVectors, covarianceMatrixInverse)[5].mahal;
    });
    console.log('authentic distances', authenticDistances);

    var imposterDistances = _.map(imposterVectors, function(p) {
        return getSortedNeighborDistances(p, trainingVectors, covarianceMatrixInverse)[5].mahal;
    });
    console.log('imposter distances', imposterDistances);

    for (var i = 1; i < 10000; i++) {
        // when FAR = FRR, we've got the right threshold.
        threshold = i/factor; 
        var authenticRejections = 0;
        var falseAcceptances = 0;
        for (var a = 0; a < authenticVectors.length; a++) {
            var nearestA = authenticDistances[a];
            if (nearestA > threshold) {
                authenticRejections++;
            }
        }
        for (var p = 0; p < imposterVectors.length; p++) {
            var nearestP = imposterDistances[p];
            if (nearestP < threshold) {
                falseAcceptances++;
            }
        }

        if (authenticRejections === falseAcceptances) {
            eer = authenticRejections/authenticVectors.length;
            break;
        }
    }

    return eer;
}

function zeroMissFalseAlarmRate(covarianceMatrixInverse, trainingVectors, authenticVectors, imposterVectors) {
    // when imposter is always detected, what is the % of the time that the authentic user is not accepted?
     if (authenticVectors.length !== imposterVectors.length) {
        console.log("Must provide as many authentic samples as imposter samples");
        return;
    }
    var factor = 1000, // increments of .001 are nice
        zmfar,
        threshold;

    var authenticDistances = _.map(authenticVectors, function(a) {
        return getSortedNeighborDistances(a, trainingVectors, covarianceMatrixInverse)[5].mahal;
    });

    var imposterDistances = _.map(imposterVectors, function(p) {
        return getSortedNeighborDistances(p, trainingVectors, covarianceMatrixInverse)[5].mahal;
    });

    for (var i = 10000; i > 1; i--) {
        // when False Acceptance Rate = 0, we've got the right threshold. Just find how many authentic were bounced at that threshold.
        // Work backward from a high error rate
        threshold = i/factor; 
        var authenticRejections = 0;
        var falseAcceptances = 0;
        for (var a = 0; a < authenticVectors.length; a++) {
            var nearestA = authenticDistances[a];
            if (nearestA > threshold) {
                authenticRejections++;
            }
        }
        for (var p = 0; p < imposterVectors.length; p++) {
            var nearestP = imposterDistances[p];
            if (nearestP < threshold) {
                falseAcceptances++;
            }
        }
        if (falseAcceptances === 0) {
            zmfar = authenticRejections/authenticVectors.length;
            break;
        }
    }

    return zmfar;
}
