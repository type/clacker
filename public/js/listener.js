$(document).ready(function() {
    var keys = [],
        tolerance = 2,
        real = [],
        imposters = [],
        dictionary = ["there"]/*["number", "people", "there", "which", "their", "other", "about", "these", "would", "write", "could", "first", "water", "that", "with", "they", "this", "have", "from", "word", "what", "were", "when", "your", "said", "each", "will", "many", "then", "them", "some", "make", "like", "into", "time", "look", "more", "than", "been", "call", "find", "long", "down", "come", "made", "part", "and", "was", "for", "are", "one", "had", "but", "not", "can", "use", "she", "how", "him", "has", "two", "see", "way", "who", "oil", "its", "now", "day", "did", "get", "may"],*/

        maxWord = _.max(_.map(dictionary, function(w) {
            return w.length;
        }));
    
    dictionary = _.map(dictionary, function(word) {
        return {
            word: word, 
            regex: new RegExp(word, "i")
        };
    });

    $('#reset').on('click', function() {
        localStorage.clear();
        $('#distance-chart').html('');
        $('#timing-chart').html('');
        $('#manhattan-chart').html('');
        $('#euclidean-chart').html('');
        $('#input-area').val('');
    });

    
    $('#input-area').on('keydown', function(e) {
        keys.push({letter: String.fromCharCode(e.keyCode), downtime: e.timeStamp, uptime: null});
    });

    $('#input-area').on('keyup', function(e) {
        var nearest = keys[findNearest(keys, String.fromCharCode(e.keyCode))];

        var mahalanobisDistance,
            neighborDistances,
            mDistanceArray,
            eDistanceArray,
            manDistanceArray,
            covariance,
            euclideanDist,
            manhattanDist,
            mean,
            meanChartData,
            euclideanChartData,
            manhattanChartData,
            sampleChartData,
            mahalChartData,
            threshold;

        if (nearest) {
            nearest.uptime = e.timeStamp;
        }
        // It may take until the key up event AFTER the last (letter in the word) key was 
        // released to capture the ACTUAL last release.
        // Example: down t down h up t down e up e up h
        var wordObj = testWords(keys, dictionary);

        if (wordObj && _.every(keys, function(k) {return k.uptime && k.downtime;})) {
            var theWord = wordObj.word;
            // now we need to find the relevant keystrokes in the keys array since more than what we need
            // may have been captured
            var timingVector = createTimingVector(findRelevantKeys(keys, wordObj));
            keys = _.last(keys, wordObj.word.length - 1); // people press multiple keys at the same time while typing--can't fully clear array

            var vectorArray = localStorage.getItem(theWord);
                vectorArray = JSON.parse(vectorArray) || [];

            if (vectorArray.length === 20) {
                if (!localStorage.getItem(theWord + "CovarianceMatrixInverse")) {
                    // We have just enough data to establish a covariance matrix and mean vector
                    covariance = createCovarianceMatrixInverse(vectorArray);
                    mean = getMeanVector(vectorArray);
                    threshold = calculateThresholdNN(vectorArray, covariance, tolerance);

                    localStorage.setItem(theWord + "CovarianceMatrixInverse", JSON.stringify(covariance));
                    localStorage.setItem(theWord + "MeanVector", JSON.stringify(mean));
                    localStorage.setItem(theWord + "Threshold", JSON.stringify(threshold));
                    
                    $.ajax({
                        type: "POST",
                        url: "/covariance",
                        data: {
                            "userId": $('#user').val(),
                            "word": theWord,
                            "covarianceMatrixInverse": covariance
                        }, 
                        success: function() {
                            //noop
                        }
                    });
                }
                else {
                    // test the timingVector to classify it
                    covariance = JSON.parse(localStorage.getItem(theWord + "CovarianceMatrixInverse"));
                    $.ajax({
                        type: "POST",
                        url: "/addtiming",
                        data: {
                            "userId": $('#user').val(),
                            "word": theWord,
                            "timingVector": timingVector
                        }, 
                        success: function() {
                            //noop
                        }
                    });        

                    mean = JSON.parse(localStorage.getItem(theWord + "MeanVector"))
                    threshold = JSON.parse(localStorage.getItem(theWord + "Threshold"));
                    mahalanobisDistance  = mahalDist(covariance, mean, timingVector);
                    
                    // find the distances to all known nodes (both euclidean and mahal)
                    neighborDistances = getSortedNeighborDistances(timingVector, vectorArray, covariance);
                    euclideanDist = euclideanDistance(mean, timingVector);
                    manhattanDist = manhattanDistance(mean, timingVector);

                    mDistanceArray = JSON.parse(localStorage.getItem(theWord + "MahalDistances")) || [];
                    mDistanceArray.push(mahalanobisDistance);

                    eDistanceArray = JSON.parse(localStorage.getItem(theWord + "EucDistances")) || [];
                    eDistanceArray.push(euclideanDist);

                    manDistanceArray = JSON.parse(localStorage.getItem(theWord + "ManDistances")) || [];
                    manDistanceArray.push(manhattanDist);
                    
                    localStorage.setItem(theWord + "MahalDistances", JSON.stringify(mDistanceArray));
                    localStorage.setItem(theWord + "EucDistances", JSON.stringify(eDistanceArray));
                    localStorage.setItem(theWord + "ManDistances", JSON.stringify(manDistanceArray));

                    mahalChartData = pairs(mDistanceArray);

                    euclideanChartData = pairs(eDistanceArray);

                    manhattanChartData = pairs(manDistanceArray);

                    meanChartData = pairs(mean);

                    sampleChartData = pairs(timingVector);
                    
                    // draw comparison graph of this timing vector vs mean vector
                    $.plot($("#timing-chart"), [ 
                        { label: "Mean", color: 'black', data: meanChartData },
                        { label: "Sample", data: sampleChartData }
                        ], 
                        { yaxis: { max: _.max(timingVector.concat(mean)) } }
                    );

                    $.plot($("#distance-chart"), [ 
                        { label: "Mahalanobis Distance", color: 'black', data: mahalChartData },
                        { label: "Euclidean Distance", color: 'blue', data: euclideanChartData },
                        { label: "Manhattan Distance", color: 'green', data: manhattanChartData }
                        ], 
                        { yaxis: { max: _.max(mDistanceArray.concat(eDistanceArray).concat(manDistanceArray)) } }
                    );

                    var nn = _.first(neighborDistances).mahal;
                    
                    console.log("The threshold", threshold, "nn is", _.first(neighborDistances).mahal); 

                    if (nn > threshold) {
                        alert("Not your normal self?" + nn);
                    }
                }
            }

            else {
                // pile them in

                vectorArray.push(timingVector)
                localStorage.setItem(wordObj.word, JSON.stringify(vectorArray));

            }

        }
        else {
            // we can safely truncate all but the last few characters--those must stay in case the user is
            // presently typing the longest word in our dictionary
            if (keys.length > 2 * maxWord) {
                keys = _.last(keys, maxWord);
            }
        }
    });

    function findNearest(keyArray, letter) {
        for (var i = keyArray.length - 1 ; i >= 0; i--) {
            if (keyArray[i].letter === letter && keyArray[i].uptime === null) {
                return i;
            }
        }
    }

    function testWords(keyArray, dictionary) {
        // find if any of our recognizable words have been typed
        var curKeys = keyArray.map(function(k) { return k.letter; }).join('');
        return _.find(dictionary, function(word) {
            return word.regex.test(curKeys);
        });    
    }

    function findRelevantKeys(keyArray, word) {
        // turn the key array into just the keys, put them into a string
        // find the index in the string of the word
        // slice out from that index to the length of the word from keyArray
        var toWord = _.map(keyArray, function(key) {
            return key.letter
        }).join('');
        var start = toWord.substr(0).search(word.regex);
        return keyArray.slice(start, start + word.word.length);
    }

    function createTimingVector(keyArray) {
        var vec =  _.flatten(_.map(keyArray, function(key, i) {
            var flightTime = (i > 0) ? keyArray[i - 1].uptime - key.downtime : 0;
            if (i === 0) {
                return [key.uptime - key.downtime]
            }
            if (key.uptime === null) {
                key.uptime = keyArray[i -1].uptime; // it's possible to release two keys at once and fail to register up
            }
            return [flightTime, key.uptime - key.downtime]
        }));
        console.log(vec);
        return vec;
    }

    function pairs(array) {
        return  _.map(array, function(v, i) {
            return [i, v];
        });
    }

    $('#calculate').click(function() {
        var authentic = $('#authentic-user').val();
        var imposter = $('#imposter-user').val();
        var word = $('#word').val();
        $.ajax({
            type: "POST",
            url: "/finderrorrates",
            data: JSON.stringify({
                "authenticUserId": authentic,
                "imposterUserId": imposter,
                "word": word 
            }), 
            contentType: "application/json",
            success: function(data) {
                var authenticCovariance = data.authentic.covarianceMatrixInverse,
                    authenticVectors = data.authentic.timingVectors,
                    trainingVectors = localStorage.getItem(word)
                    imposterVectors = data.imposter.timingVectors;


                var eer = equalErrorRateNN(authenticCovariance, trainingVectors, authenticVectors, imposterVectors);
                var zmfar = zeroMissFalseAlarmRate(authenticCovariance, trainingVectors, authenticVectors, imposterVectors);

                console.log("EER", eer, "ZeroMissFAR", zmfar);

            }
        });  
    });
});
