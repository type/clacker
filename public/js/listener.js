$(document).ready(function() {
    var words = [ "the", "bread"];
    
    var keys = [];

    words = _.map(words, function(word) {
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
        var wordObj = testWords(keys, words);
        if (wordObj) {
            // do covariance stuff
            var vector = createTimingVector(findRelevantKeys(keys, wordObj));
            // now we need to find the relevant keystrokes in the keys array since more than what we need
            // may have been captured
            console.log(vector);
            keys = [];
        }
    });

    function findNearest(keyArray, letter) {
        for (var i = keyArray.length - 1 ; i >= 0; i--) {
            if (keyArray[i].letter === letter) {
                return i;
            }
        }
    }

    function testWords(keyArray, words) {
        // find if any of our good words have been typed
        var curKeys = keyArray.map(function(k) { return k.letter; }).join('');
        return _.find(words, function(word) {
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

    function createTimingVector(sliced) {
        return _.flatten(_.map(sliced, function(key) {
            return [key.downtime, key.uptime - key.downtime]
        }));
    }
});

