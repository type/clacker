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
            // now we need to find the relevant keystrokes in the keys array since more than what we need
            // may have been captured
            var vector = createTimingVector(findRelevantKeys(keys, wordObj));
            keys = _.last(keys, 2); // people press multiple keys at the same time while typing--can't fully clear array
            
            var storage = localStorage.getItem(wordObj.word);
            storage = JSON.parse(storage) || [];

            if (storage.length > 10) {
                // We are safe to establish a covariance matrix
                createCovarianceMatrix(storage);
            }

            else {

                storage.push(vector)
                localStorage.setItem(wordObj.word, JSON.stringify(storage));

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
        return _.flatten(_.map(keyArray, function(key, i) {
            var flightTime = (i > 0) ? keyArray[i - 1].uptime - key.downtime : 0;
            if (i === 0) {
                return [key.uptime - key.downtime]
            }
            return [flightTime, key.uptime - key.downtime]
        }));
    }
});
