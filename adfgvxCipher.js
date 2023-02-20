'use strict'

// The ADFGVX Cipher 
// https://en.wikipedia.org/wiki/ADFGVX_cipher

let KeywordRouteList = ['Rows from top left',
                        'Rows from top right',
                        'Rows from bottom left',
                        'Rows from bottom right'];

let KeywordRouteListValue = ['rftl',
                                'rftr',
                                'rfbl',
                                'rfbr'];

let option;

// Fill options for first keyword route list

for(let i = 0; i < KeywordRouteList.length; i++) {
    option = document.createElement('option');
    option.text = KeywordRouteList[i];
    option.value = KeywordRouteListValue[i];
    document.querySelector('#keyWordRoute').add(option, null);
}

const adfgvxCipher = () => {
    let symbols = document.getElementById("symbols").value; // plain text
    let mode = document.getElementById("mode").value;
    let gridKeyWord = document.getElementById("gridKeyword").value;
    let transKeyword = document.getElementById("transKeyword").value;
    let keyWordRoute = document.getElementById("keyWordRoute").value;

    console.log(symbols);
    console.log(mode);
    console.log(gridKeyWord);
    console.log(transKeyword);
    console.log(keyWordRoute);

    // clean plain text(symbols), gridKeyword and transKeyword so only lower case, a-z and 0-9
    symbols = symbols.toLowerCase();
    symbols = symbols.match(/[a-z0-9]/g);

    gridKeyWord = gridKeyWord.toLowerCase();
    gridKeyWord = gridKeyWord.match(/[a-z]/g); // only letters for keywords, match returns an array

    transKeyword = transKeyword.toLowerCase();
    transKeyword = transKeyword.match(/[a-z]/g);

    gridKeyWord = addNumbers(keyedAlphabet(gridKeyWord)); // numbers being added last which is not ideal
    console.log(gridKeyWord);
    const myMatrix = matrix(keyWordRoute, gridKeyWord);
    console.log(`first: `, myMatrix);

    if(mode == 'encrypt') {
        const translated = encrypt(symbols, transKeyword, myMatrix);
    } else if(mode == 'decrypt') {
        const translated = decrypt(symbols, transKeyword, myMatrix);
    }
}

const encrypt = (plainText, transKeyword, matrix) => {
    let completeCipher = '';

    for(let i = 0; i < plainText.length; i++) { // maybe this for loop should be integrated into getCipher, 
        completeCipher += getCipher(plainText[i], matrix);  // getCipher should accept plainText and retrun completeCipher
    }

    console.log(`completeCipher: `, completeCipher);
    console.log(`completeCipher.length: `, completeCipher.length);

    const yDimOfTransKey = Math.floor(completeCipher.length / transKeyword.length);

    console.log(`yDimOfTransKey: `, yDimOfTransKey);

    const transGrid = [];   // create transposition grid
    for(let i = 0; i <= yDimOfTransKey; i++) {
        transGrid[i] = [];
    }

    // fill transposition grid
    let count = 0;

    for(let y = 0; y <= yDimOfTransKey; y++){
        for(let x = 0; x < transKeyword.length; x++) {
            transGrid[y][x] = completeCipher[count++];
        }
    }

    console.log(`transGrid: `, transGrid);
    console.log(`transKeyword: `, transKeyword);

    // ***

    const sortedTransKey = sortAlpha(transKeyword);

    console.log(`sortedTranskey: `, sortedTransKey);

    const transKeyOrder = [];

    // generate single dimension array from 0 to length of transposition key using the sorted transposition key
    // to create a vertical read order for the final cipher.  Wiki link provided above for description of workings.

    for(let i = 0; i < transKeyword.length; i++) {
        for(let j = 0; j < sortedTransKey.length; j++) {
            if(transKeyword[i] == sortedTransKey[j]) {
                transKeyOrder[i] = j;   // j is position of letter in transposition key (transKeyword)
            }
        }
    }

    console.log(`transKeyOrder: `, transKeyOrder);

    for(let i = 0; i < transKeyword.length; i++) {
        for(let j = 0; j < transKeyOrder.length; j++) { // j is true position or x dimension
            if(transKeyOrder[j] == i) {
                // console.log(j);
                showVerticalCipher(j, transGrid, yDimOfTransKey);
            }
        }
    }
}

const decrypt = (cipherText, transKeyword, matrix) => {
    // gvadxavadxdadaddvafgxdaxvdfaddav
    // gvadxavadxdadaddvafgxdaxvdfaddav

    console.log('In decrypt()')

    console.log(`cipherText: `, cipherText);

    let plainText = '';
    let reCipherText = '';

    const lengthOfTranskey = transKeyword.length;
    const lengthOfCipher = cipherText.length;
    const heightOfColumn = Math.ceil(lengthOfCipher / lengthOfTranskey);
    const sentinel = Math.floor(lengthOfCipher / lengthOfTranskey);

    console.log(`lengthOfTranskey: `, lengthOfTranskey);
    console.log(`lengthOfCipher: `, lengthOfCipher);
    console.log(`heightOfColumn: `, heightOfColumn);
    console.log(`sentinel: `, sentinel);

    const transGrid = [];

    for(let i = 0; i <= heightOfColumn; i++) {
        transGrid[i] = [];
    }
    
    console.log(`transGrid: `, transGrid);

    // generate 1D array of numbers from transKeyword

    const sortedTransKey = sortAlpha(transKeyword);

    console.log(`sortedTranskey: `, sortedTransKey);
    console.log(`transKeyword: `, transKeyword);

    const transKeyOrder = [];

    for(let i = 0; i < transKeyword.length; i++) {
        for(let j = 0; j < sortedTransKey.length; j++) {
            if(transKeyword[i] == sortedTransKey[j]) {
                transKeyOrder[i] = j;
            }
        }
    }

    console.log(`transKeyOrder: `, transKeyOrder);

    // fill in each square column

    let count = 0;

    for(let i = 0; i < transKeyword.length; i++) {
        for(let j = 0; j < transKeyOrder.length; j++) {
            if(transKeyOrder[j] == i) { // j is true position or x dimension or column
                // fill in column from cipherText
                if(j < sentinel) {
                    for(let k = 0; k < heightOfColumn; k++) {
                        transGrid[k][j] = cipherText[count++];
                    }    
                } else if(j >= sentinel) {
                    for(let k = 0; k < heightOfColumn - 1; k++) {
                        transGrid[k][j] = cipherText[count++];
                    }
                }

            }

        }
    }

    console.log(`transGrid: `, transGrid);

    // translate transGrid into ciphertext and then convert into plainText

    for(let y = 0; y < heightOfColumn; y++) {
        for(let x = 0; x < lengthOfTranskey; x++) {
            if(typeof transGrid[y][x] !== 'undefined') {
                reCipherText += transGrid[y][x];
            }
        }
    }

    console.log(`reCipherText: `, reCipherText);

    console.log(getPlainText(reCipherText, matrix));

}

const getTransKeyOrder = (transKeyword) => {

    const sortedTransKey = sortAlpha(transKeyword);

    // console.log(`sortedTranskey: `, sortedTransKey);

    const transKeyOrder = [];

    // generate single dimension array from 0 to length of transposition key using the sorted transposition key
    // to create a vertical read order for the final cipher.  Wiki link provided above for description of workings.

    for(let i = 0; i < transKeyword.length; i++) {
        for(let j = 0; j < sortedTransKey.length; j++) {
            if(transKeyword[i] == sortedTransKey[j]) {
                transKeyOrder[i] = j;   // j is position of letter in transposition key (transKeyword)
            }
        }
    }

    // console.log(`transKeyOrder: `, transKeyOrder);  
    
    return transKeyOrder;
}

const showVerticalCipher = (column, transGrid, yDimOfTransKey) => {
    let cipherString = '';

    for(let y = 0; y <= yDimOfTransKey; y++) {
        if(typeof transGrid[y][column] !== 'undefined') {
            // console.log(transGrid[y][column]);
            cipherString += transGrid[y][column];
        }
    }

    console.log(`cipherString: `, cipherString);
}

const sortAlpha = arr => {
    const newArr = arr.slice();
    return newArr.sort(function(a, b) {
        return a === b ? 0: a > b ? 1: - 1;
    });
}

const getPlainText = (cipherText, matrix) => {
    const adfgvx = {
        'a': 0,
        'd': 1,
        'f': 2,
        'g': 3,
        'v': 4,
        'x': 5,
    }

    let y = 0;
    let x = 0;
    let plainText = '';

    for(let i = 0; i < cipherText.length; i += 2) {
        y = adfgvx[cipherText[i]];
        x = adfgvx[cipherText[i+1]];
        console.log(matrix[y][x]);

        plainText += matrix[y][x];
        // console.log(matrix[[cipherText[i]][cipherText[i+1]]]);
        // console.log(cipherText[i+1]);
    }

    return plainText;

}

const getCipher = (letter, matrix) => {
    const adfgvx = {
        0: 'a',
        1: 'd',
        2: 'f',
        3: 'g',
        4: 'v',
        5: 'x',
    };

    let cipher = [];

    for(let y = 0; y < matrix.length; y++) {
        for(let x = 0; x < matrix.length; x++) {
            if(matrix[y][x] == letter) {
                cipher += adfgvx[y];
                cipher += adfgvx[x];
            }
        }
    }

    return cipher;
} 

const addNumbers = key => { // Is there a better way of doing this using functional methods like reduce() ???
    const atojObj = {
        a: 0,
        b: 1,
        c: 2,
        d: 3,
        e: 4,
        f: 5,
        g: 6,
        h: 7,
        i: 8,
        j: 9,
    };

    let i = 0;
    let newM = key.split('');
    newM.push('#'); // sentinel

    do {
        if(newM[i] >= 'a' && newM[i] <= 'j') {
            newM.splice((i+1),0,atojObj[newM[i]]); // splice(start, deleteCount, item1)
            i++;
        }
        i++;
    } while (newM[i] !== '#'); // do while sentinel not encountered

    newM.pop(); // drop sentinel
    return newM.join('');
}

// look into sets as a better way to do this

const keyedAlphabet = (additiveKey, alphabet = 'abcdefghijklmnopqrstuvwxyz') => {
    let frontKey = noRepeats(additiveKey);

    for(let symbol of frontKey) {
        if (alphabet.includes(symbol)) {
            alphabet = alphabet.replace(symbol, '');
        }
    }

    return frontKey + alphabet;
}

const noRepeats = (dirtyKey) => {
    let newKey="";

    for (let symbol of dirtyKey) {
        if (!newKey.includes(symbol)) {
            newKey += symbol;
        }
    }

    return newKey;
}

const matrix = (keyWordRoute, keyWord) => {
    const route = [];
    for(let i = 0; i < 36; i++) {
        route[i] = [];
    }

    let count = 0;

    // each route can be programmed by hand or using an algorithm if one is available

    switch(keyWordRoute) {
        case 'rftl':
            count = 0;
            for(let i = 0; i < 6; i++) {
                for(let j = 0; j < 6; j++) {
                    route[count] = [i, j];
                    count++;
                }
            }
            break;
    }

    // fill matrix according to route and return

    let matrix = [];
    for(let i = 0; i < 6; i++) {
        matrix[i] = [];
    }

    count = 0;

    for(let i = 0; i < 36; i++) { // fill the matrix
        matrix[ route[i][0] ][ route[i][1] ] = keyWord[i];
    }

    return matrix;
}