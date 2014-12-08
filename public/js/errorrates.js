function getErrorRates(covarianceMatrixInverse, trainingVectors, authenticVectors, imposterVectors) {
    var authenticDistances = _.map(authenticVectors, function(a) {
        return getSortedNeighborDistances(a, trainingVectors, covarianceMatrixInverse)[3];
    });


    var imposterDistances = _.map(imposterVectors, function(p) {
        return getSortedNeighborDistances(p, trainingVectors, covarianceMatrixInverse)[3];
    });

    var factor = 100, 
        result = {};
    
    var types = _.keys(authenticDistances[0]);
    
    _.each(types, function(type) {
        result[type] = {
            eer: undefined,
            zmfar: undefined
        }
        var thresholdEE,
            thresholdZM;
        var authenticRejections = 0;
        var falseAcceptances = 0;

        for (var i = 1; i < 100000; i++) {
            // when FAR = FRR, we've got the right threshold.
            thresholdEE = i/factor; 
            authenticRejections = 0;
            falseAcceptances = 0;
            for (var a = 0; a < authenticVectors.length; a++) {
                var nearestA = authenticDistances[a][type];
                if (nearestA > thresholdEE) {
                    authenticRejections++;
                }
            }
            for (var p = 0; p < imposterVectors.length; p++) {
                var nearestP = imposterDistances[p][type];
                if (nearestP < thresholdEE) {
                    falseAcceptances++;
                }
            }

            if (_.contains([ 0], authenticRejections - falseAcceptances) ) {
            //if (_.contains([ -1, 0, 1], authenticRejections - falseAcceptances) ) {
                // Switch line comment to allow +/- 1% buffer for weird edge cases
                result[type].eer = authenticRejections/authenticVectors.length;
                break;
            }
        }

        for (var x = 50000; x > 1; x--) {
            // when False Acceptance Rate = 0, we've got the right threshold. Just find how many authentic were bounced at that threshold.
            // Work backward from a high error rate
            thresholdZM = x/factor; 
            authenticRejections = 0;
            falseAcceptances = 0;
            for (var a = 0; a < authenticVectors.length; a++) {
                var nearestA = authenticDistances[a][type];
                if (nearestA > thresholdZM) {
                    authenticRejections++;
                }
            }
            for (var p = 0; p < imposterVectors.length; p++) {
                var nearestP = imposterDistances[p][type];
                if (nearestP < thresholdZM) {
                    falseAcceptances++;
                }
            }
            if (falseAcceptances === 0) {
                result[type].zmfar = authenticRejections/authenticVectors.length;
                break;
            }
        }
    });
    
    return result;
}
