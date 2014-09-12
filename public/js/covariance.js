/* Covariance functions */
function createCovarianceMatrix(timingVectorMatrix) {
    var transposed = transpose(timingVectorMatrix); // input matrix has columns as rows -- need other way
    var n = transposed.length,
        S = new Array(n);
    for (var i = 0; i < n; i++) {
        // create n*n matrix from m*n input matrix (m = number rows, n = number of cols)
        S[i] = new Array(n);
    }
    for (var i = 0; i < n; i++) {
        S[i][i] = vari(transposed[i]);
        for (var j = i + 1; j < n; j++) {
            S[i][j] = cov(transposed[i], transposed[j]);
            S[j][i] = S[i][j]; // variance values are reflected across top left - bottom right diagonal
        }
    }
    console.log("Covariance matrix", JSON.stringify(S));
    return S;
}

function getMeanVector(matrix) {
    var transposed = transpose(matrix); // input matrix has columns as rows -- need other way
    return meanVector(transposed); // mean vector for use to compute mahalanobis distance
}

function computeMahalanobisDistance(covarianceMatrix, meanVector, sampleVector) {
    // square root (Transpose(sampleVector - meanVector) * Inverse Covariance * (sampleVector - Mean Vector))
        // names are confusing here, but we need a columnar matrix for the "transpose difference" (left) matrix,
        // and a row matrix for the regular "difference". This is a cheap trick to get them.
    var differenceTranspose = [difference(sampleVector, meanVector)], // need a columnar matrix 
        differenceVector = transpose(differenceTranspose), // need a row matrix
        inverseCovariance = matrix_invert(covarianceMatrix);

    var mahalanobisDistance = multiplyMatrices(multiplyMatrices(differenceTranspose, inverseCovariance), differenceVector);
    return mahalanobisDistance[0][0];
}

function classifyVector(mahalanobisDistance, threshold) {
    // if it's over something, it's bad
    return mahalanobisDistance <= 2 * 30000; // 30000 just a standin value based off my own typing patterns
}

function difference(v1, v2) {
    return _.map(v1, function(value, index) {
        return value - v2[index];
    });
}

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

function multiplyMatrices(m1, m2) {
    // from http://tech.pro/tutorial/1527/matrix-multiplication-in-functional-javascript
    var result = [];
    for (var i = 0; i < m1.length; i++) {
        result[i] = [];
        for (var j = 0; j < m2[0].length; j++) {
            var sum = 0;
            for (var k = 0; k < m1[0].length; k++) {
                sum += m1[i][k] * m2[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}

function cov(a, b) {
    // This was taken from https://github.com/bytespider/covariance
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


function meanVector(matrix) {
    // go through each of the items in the array
    // for each index in each of the arrays, we need to maintain some partial sum
    console.log("Input to mean vector", matrix);
    var mean = _.map(matrix, function(row) {
        return (_.reduce(row, function(memo, num) {
            return memo + num;
        }, 0))/row.length;
    });

    console.log("Average vector", mean);
    return mean;
}



/* Mahalanobis distance functions */
function transpose(mat) {
    return Object.keys(mat[0]).map(
        function (c) { return mat.map(function (r) { return r[c]; }); }
    );
}

// Returns the inverse of matrix `M`.
function matrix_invert(M){
    // Taken from http://blog.acipo.com/matrix-inversion-in-javascript/
    // I use Guassian Elimination to calculate the inverse:
    // (1) 'augment' the matrix (left) by the identity (on the right)
    // (2) Turn the matrix on the left into the identity by elemetry row ops
    // (3) The matrix on the right is the inverse (was the identity matrix)
    // There are 3 elemtary row ops: (I combine b and c in my code)
    // (a) Swap 2 rows
    // (b) Multiply a row by a scalar
    // (c) Add 2 rows
    
    //if the matrix isn't square: exit (error)
    if(M.length !== M[0].length){return;}
    
    //create the identity matrix (I), and a copy (C) of the original
    var i=0, ii=0, j=0, dim=M.length, e=0, t=0;
    var I = [], C = [];
    for(i=0; i<dim; i+=1){
        // Create the row
        I[I.length]=[];
        C[C.length]=[];
        for(j=0; j<dim; j+=1){
            
            //if we're on the diagonal, put a 1 (for identity)
            if(i==j){ I[i][j] = 1; }
            else{ I[i][j] = 0; }
            
            // Also, make the copy of the original
            C[i][j] = M[i][j];
        }
    }
    
    // Perform elementary row operations
    for(i=0; i<dim; i+=1){
        // get the element e on the diagonal
        e = C[i][i];
        
        // if we have a 0 on the diagonal (we'll need to swap with a lower row)
        if(e==0){
            //look through every row below the i'th row
            for(ii=i+1; ii<dim; ii+=1){
                //if the ii'th row has a non-0 in the i'th col
                if(C[ii][i] != 0){
                    //it would make the diagonal have a non-0 so swap it
                    for(j=0; j<dim; j++){
                        e = C[i][j];       //temp store i'th row
                        C[i][j] = C[ii][j];//replace i'th row by ii'th
                        C[ii][j] = e;      //repace ii'th by temp
                        e = I[i][j];       //temp store i'th row
                        I[i][j] = I[ii][j];//replace i'th row by ii'th
                        I[ii][j] = e;      //repace ii'th by temp
                    }
                    //don't bother checking other rows since we've swapped
                    break;
                }
            }
            //get the new diagonal
            e = C[i][i];
            //if it's still 0, not invertable (error)
            if(e==0){return}
        }
        
        // Scale this row down by e (so we have a 1 on the diagonal)
        for(j=0; j<dim; j++){
            C[i][j] = C[i][j]/e; //apply to original matrix
            I[i][j] = I[i][j]/e; //apply to identity
        }
        
        // Subtract this row (scaled appropriately for each row) from ALL of
        // the other rows so that there will be 0's in this column in the
        // rows above and below this one
        for(ii=0; ii<dim; ii++){
            // Only apply to other rows (we want a 1 on the diagonal)
            if(ii==i){continue;}
            
            // We want to change this element to 0
            e = C[ii][i];
            
            // Subtract (the row above(or below) scaled by e) from (the
            // current row) but start at the i'th column and assume all the
            // stuff left of diagonal is 0 (which it should be if we made this
            // algorithm correctly)
            for(j=0; j<dim; j++){
                C[ii][j] -= e*C[i][j]; //apply to original matrix
                I[ii][j] -= e*I[i][j]; //apply to identity
            }
        }
    }
    
    //we've done all operations, C should be the identity
    //matrix I should be the inverse:
    return I;
}
