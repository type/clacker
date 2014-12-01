function equalErrorRateNN(covarianceMatrixInverse, trainingVectors, authenticVectors, imposterVectors) {
    // what is the rate where the authentic user is rejected as often as an imposter is accepted?
    // we play with the threshold so that these two rates are the same, then find what the EER is.
   /* imposterVectors = [[8,-65,71,-48,72,-744,80,-96,64],[72,-64,64,-80,83,-190,71,-80,96],[71,-73,72,-88,88,-144,56,-64,71],[88,-32,80,-64,88,-160,104,-128,152],[95,-49,90,-30,120,-48,96,-32,144],[95,-76,55,-62,143,-72,105,-24,224],[87,-41,99,-13,128,-40,104,-24,136],[104,-16,96,-24,152,-8,80,-24,144],[107,-20,105,-16,159,-25,95,-33,199],[95,-41,88,-17,135,-36,107,-33,199],[87,-41,103,-9,157,-20,78,-33,143],[2,-8,105,33,127,-41,111,-129,128],[120,-73,75,-5,128,-31,89,-24,135],[113,-55,87,-25,136,-24,104,-16,143],[103,-89,80,0,152,-7,121,-8,152],[96,-48,104,-24,208,15,135,-56,176],[112,-64,110,-1,137,-40,120,-89,151],[95,-73,95,-8,148,-20,152,-56,144],[112,-48,80,8,152,-13,123,-152,256],[120,-46,75,-7,152,-9,135,-40,160]];

    authenticVectors = [[95,-19,101,40,104,7,151,64,130],[112,32,64,-24,128,23,175,55,135],[138,26,80,16,112,8,184,79,127],[127,39,87,-16,98,26,193,72,135],[136,31,103,15,111,15,160,65,168],[148,36,104,39,119,23,159,47,135],[128,23,111,-8,120,16,152,48,113],[112,24,80,24,120,24,120,56,128],[104,40,104,24,128,40,184,64,128],[128,48,103,7,112,24,160,64,128],[120,24,88,8,104,16,168,56,136],[129,41,96,8,120,8,144,48,144],[111,39,80,-8,114,18,159,63,151],[128,0,63,15,136,16,143,55,144],[127,23,104,-16,128,16,143,55,152],[160,16,96,8,168,16,199,79,175],[160,-8,80,-216,152,-160,152,64,151],[125,-48,88,-8,120,24,152,48,136],[112,40,72,-88,112,-80,128,72,152],[112,24,85,13,103,4,108,20,100]];
    */

    if (authenticVectors.length !== imposterVectors.length) {
        console.log("Must provide as many authentic samples as imposter samples");
        return;
    }
    var factor = 1000, // increments of .01 are useful for nearest neighbor
        eer,
        threshold;

    var authenticDistances = _.map(authenticVectors, function(a) {
        console.log(a);
        return _.first(getSortedNeighborDistances(a, trainingVectors, covarianceMatrixInverse)).mahal;
    });

    var imposterDistances = _.map(imposterVectors, function(p) {
        console.log(p);
        return _.first(getSortedNeighborDistances(p, trainingVectors, covarianceMatrixInverse)).mahal;
    });

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
        console.log("Threshold", threshold);
        console.log("Authentic Rejected", authenticRejections);
        console.log("False Acceptances", falseAcceptances);

        if (authenticRejections === falseAcceptances) {
            eer = authenticRejections/authenticVectors.length;
            console.log("EER FOUND", eer);
            break;
        }
    }

    return eer;
}

function zeroMissFalseAlarmRate() {
    // when imposter is always detected, what is the % of the time that the authentic user is not accepted?
}
