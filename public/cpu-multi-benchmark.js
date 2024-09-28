const generateMatrices = () => {
    const matrices = [[], []];
    for (let y = 0; y < 150; y++) {
        matrices[0].push([]);
        matrices[1].push([]);
        for (let x = 0; x < 150; x++) {
            matrices[0][y].push(Math.random());
            matrices[1][y].push(Math.random());
        }
    }
    return matrices;
}

const multiplyMatrixCPU = function (a, b, sz) {
    let productRow = Array.apply(null, new Array(sz)).map(Number.prototype.valueOf, 0);
    let product = new Array(sz);

    for (let p = 0; p < sz; p++) {
        product[p] = productRow.slice();
    }

    for (let i = 0; i < sz; i++) {
        for (let j = 0; j < sz; j++) {
            for (let k = 0; k < sz; k++) {
                product[i][j] += a[i][k] * b[k][j];
            }
        }
    }
}

var cpumat = generateMatrices();

function bench() {
    while (true) {
        multiplyMatrixCPU(cpumat[0], cpumat[1], 150);
        postMessage("done");
    }
}

bench();