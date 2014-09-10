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
        if (testWords(keys, words)) {
            // do covariance stuff
            alert('got it!');
            console.log(keys);
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
});

