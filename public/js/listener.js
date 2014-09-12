$(document).ready(function() {
    var keys = [],
        dictionary = [ "the", "bread"],
        maxWord = _.max(_.map(dictionary, function(w) {
            return w.length;
        }));
    
    dictionary = _.map(dictionary, function(word) {
        return {
            word: word, 
            regex: new RegExp(word, "i")
        };
    });

    
    $('#blah').on('keydown', function(e) {
        keys.push({letter: String.fromCharCode(e.keyCode), downtime: e.timeStamp, uptime: null});
    });

    $('#blah').on('keyup', function(e) {
        keys[findNearest(keys, String.fromCharCode(e.keyCode))].uptime = e.timeStamp;
        var wordObj = testWords(keys, dictionary);
        if (wordObj) {
            var theWord = wordObj.word;
            // now we need to find the relevant keystrokes in the keys array since more than what we need
            // may have been captured
            var timingVector = createTimingVector(findRelevantKeys(keys, wordObj));
            keys = _.last(keys, 2); // people press multiple keys at the same time while typing--can't fully clear array

            var vectorArray = localStorage.getItem(theWord);
            vectorArray = JSON.parse(vectorArray) || [];

            if (vectorArray.length === 6) {
                if (!localStorage.getItem(theWord + "CovarianceMatrix")) {
                    // We have enough data to establish a covariance matrix
                    var covariance = createCovarianceMatrix(vectorArray);
                    console.log(covariance);
                    var mean = getMeanVector(vectorArray);
                    localStorage.setItem(theWord + "CovarianceMatrix", JSON.stringify(covariance));
                    localStorage.setItem(theWord + "MeanVector", JSON.stringify(mean));
                }
                else {
                    // test the timingVector!
                    var mahalanobisDistance = computeMahalanobisDistance(JSON.parse(localStorage.getItem(theWord + "CovarianceMatrix")), JSON.parse(localStorage.getItem(theWord + "MeanVector")), timingVector);
                    if (!classifyVector(mahalanobisDistance)) {
                        alert("Not your normal self?");
                    }
                }
            }

            else {

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
});
