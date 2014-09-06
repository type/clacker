var xs = [];
xs[0] = [90, 90, 60, 60, 30];
xs[1] = [60, 90, 60, 60, 30];
xs[2] = [90, 30, 60, 90, 30];
console.log(xs);
var n = 3;
var S = new Array(n);
for (var i = 0; i < n; i++) {
    S[i] = new Array(n);
}
for (var i = 0; i < n; i++) {
    S[i][i] = vari(xs[i]);
    for (var j = i + 1; j < n; j++) {
        S[i][j] = cov(xs[i], xs[j]);
        S[j][i] = S[i][j];
    }
}
console.log(S);

function vari(vector) {
    var v = 0;
    for (var i = 0; i < vector.length; i++) {
        v += Math.pow((vector[i] - mean(vector)), 2);
    }
    v = v / vector.length;
    return v;
}

function mean(vector) {
    var n = 0;
    for (var i = 0; i < vector.length; i++) {
        n += vector[i];
    }
    return n / vector.length;
}

function cov(a, b) {
    var length = a.length;
    var i = 0;

    var mean_a = mean(a);
    var mean_b = mean(b);
    var values = [];

    for ( ; i < length; i += 1) {
        var diff_a = a[i] - mean_a;
        var diff_b = b[i] - mean_b;
        values.push(diff_a * diff_b);
    }

    return mean(values);
}
