// Here I rewrite the algorithm from https://lodev.org/cgtutor/randomnoise.html
// to javascript
"use strict";

var generateNoise = function(texSize){
    var noiseTexture = [];
    for (var i = 0; i < texSize * texSize; ++i){
        noiseTexture.push(Math.random());
    }
    return noiseTexture;
}

var smoothNoise = function(x, y, texSize, noiseTexture){
    var fractionX = 1.0 - x + Math.trunc(x);
    var fractionY = 1.0 - y + Math.trunc(y);

    // Neighbour around
    var x1 = Math.trunc(x);
    var y1 = Math.trunc(y);
    var x2 = (x1 + 1) % texSize;
    var y2 = (y1 + 1) % texSize;

    // bilinear interpolation to smooth the noise
    var value = 0.0;
    value += fractionX * fractionY * noiseTexture[y1 * texSize + x1];
    value += (1.0 - fractionX) * fractionY * noiseTexture[y1 * texSize + x2];
    value += fractionX * (1 - fractionY) * noiseTexture[y2 * texSize + x1];
    value += (1 - fractionX) * (1 - fractionY) * noiseTexture[y2 * texSize + x2];
    return value;
}

var turbulence = function(x, y, texSize, turSize, noiseTexture){
    var s = turSize;
    var value = 0.0;

    while(s >= 1){
        value += smoothNoise(x / s, y / s, texSize, noiseTexture) * s;
        s /= 2.0;
    }
    // This step normalize the value to nearly 0 to 255
    value = (128 / turSize) * value;
    return value;
}

var getMarbleTexture = function(texSize){
    var noiseTexture = generateNoise(texSize);

    var xPeriod = 5.0;
    var yPeriod = 10.0;
    var turScale = 5.0;
    var turSize = 64.0;

    var texture = new Uint8Array(3 * texSize * texSize);

    for (var y = 0.0; y < texSize; ++y){
        for (var x = 0.0; x < texSize; ++x){
            var xy = x * xPeriod / texSize + y * yPeriod / texSize
            + turScale * turbulence(x, y, texSize, turSize, noiseTexture) / 255.0;
            var value = 127.5 * (0.75 * Math.sin(xy * Math.PI) + 1.0);
            texture[3 * y * texSize + 3 * x] = value;
            texture[3 * y * texSize + 3 * x + 1] = value;
            texture[3 * y * texSize + 3 * x + 2] = value;
        }
    }
    return texture;
}
