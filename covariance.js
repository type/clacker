var xs = [];
xs[0] = [90, 90, 60, 60, 30];
xs[1] = [60, 90, 60, 60, 30];
xs[2] = [90, 30, 60, 90, 30];
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
console.log("S", S);

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
    // This was taken from the interwebs
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

function transpose(mat) {
    return Object.keys(mat[0]).map(
        function (c) { return mat.map(function (r) { return r[c]; }); }
    );
}

// Returns the inverse of matrix `M`.
function matrix_invert(M){
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
