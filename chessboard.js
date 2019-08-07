// This file defines the class of chessboard
// var length = 600;

/*function getChessboardTexture(){
    var data = new Uint8Array(3 * length * length);
    // The background is white
    for (var i = 0; i < length; ++i){
        for (var j = 0; j < length; ++j){
            data[3 * (length * i + j)] = 255;
            data[3 * (length * i + j) + 1] = 255;
            data[3 * (length * i + j) + 2] = 255;
        }
    }

    var numLine = 15.0;
    var stride = length / numLine;
    var offset = [-1.0, 0.0, 1.0];
    // Draw vertical lines
    for (var i = 0; i < numLine; ++i){
        for (var k = 0; k < offset.length; ++k){
            for (var j = 0; j < (length - stride); ++j){
                var x = Math.floor(stride * (1.0 / 2 + i)) + offset[k];
                var y = Math.floor(stride * 0.5) + j;
                data[3 * (length * x + y)] = 0;
                data[3 * (length * x + y) + 1] = 0;
                data[3 * (length * x + y) + 2] = 0;
            }
        }
    }
    // Draw horinzontal lines
    for (var j = 0.0; j < numLine; ++j){
        for (var k = 0; k < offset.length; ++k){
            for (var i = 0.0; i < (length - stride); ++i){
                var x = Math.floor(stride * (1.0 / 2)) + i;
                var y = Math.floor(stride * (1.0 / 2 + j)) + offset[k];
                data[3 * (length * x + y)] = 0;
                data[3 * (length * x + y) + 1] = 0;
                data[3 * (length * x + y) + 2] = 0;
            }
        }
    }
    // Draw 4 dot
    var l = [3, 11];
    offset = [-4, -3, -2, 2, 3, 4];
    for (var i = 0; i < 2; ++i){
        for (var j = 0; j < 2; ++j){
            for (var offsetX = 0; offsetX < offset.length; ++offsetX){
                for (var offsetY = 0; offsetY < offset.length; ++offsetY){
                    var x = Math.floor(stride * (1.0 / 2 + l[i])) + offset[offsetX];
                    var y = Math.floor(stride * (1.0 / 2 + l[j])) + offset[offsetY];
                    data[3 * (length * x + y)] = 0;
                    data[3 * (length * x + y) + 1] = 0;
                    data[3 * (length * x + y) + 2] = 0;
                }
            }
        }
    }

    return data;
}*/

class ChessPoint{
    constructor(globalPos, scenePos){
        // globalPos is a Vector3. scenePos is a Vector2
        this.globalPos = globalPos;
        this.scenePos = scenePos;
    }
}


class Chessboard{
    constructor(scene){
        this.width = 500;
        this.height = 100;
        this.textureLength = 512;
        var geometry = new THREE.BoxGeometry(this.width, this.height, this.width);
        // var chessPic = getChessboardTexture();
        var marblePic = getMarbleTexture(this.textureLength);
        /*var combinePic = new Uint8Array(3 * length * length);
        // combine the two textures
        for (var i = 0; i < length; ++i){
            for (var j = 0; j < length; ++j){
                combinePic[3 * (i * length + j)] = (chessPic[3 * (i * length + j)] / 255.0) * marblePic[3 * (i * length + j)];
                combinePic[3 * (i * length + j) + 1] = (chessPic[3 * (i * length + j) + 1] / 255.0) * marblePic[3 * (i * length + j) + 1];
                combinePic[3 * (i * length + j) + 2] = (chessPic[3 * (i * length + j) + 2] / 255.0) * marblePic[3 * (i * length + j) + 2];
            }
        }*/

        // get texture
        // var combineTexture = new THREE.DataTexture( combinePic, length, length, THREE.RGBFormat );
        // combineTexture.needsUpdate = true;
        var marbleTexture = new THREE.DataTexture( marblePic, this.textureLength, this.textureLength, THREE.RGBFormat );
        marbleTexture.needsUpdate = true;
        /*var materials = [];
        for (var i = 0; i < 1; ++i){
            materials.push(new THREE.MeshPhongMaterial(
                {color: 0x505050, specular: 0x333333, shininess: 15, map: marbleTexture, specularMap: marbleTexture}));
        }
        materials.push(new THREE.MeshPhongMaterial(
            {color: 0x505050, specular: 0x333333, shininess: 15, map: combineTexture, specularMap: combineTexture}));
        for (var i = 2; i < 6; ++i){
            materials.push(new THREE.MeshPhongMaterial(
                {color: 0x505050, specular: 0x333333, shininess: 15, map: marbleTexture, specularMap: marbleTexture}));
        }*/
        var material = new THREE.MeshPhongMaterial(
            {color: 0x555555, specular: 0x333333, shininess: 15, map: marbleTexture, specularMap: marbleTexture});
        this.chessboard = new THREE.Mesh(geometry, material);
        this.chessboard.position.set(0, 50, 0);
        scene.add(this.chessboard);
        this.numLine = 15;
        this.stride = this.width / this.numLine;
        var lineMaterial = new THREE.LineBasicMaterial( { color: 0x000000 } );
        for (var i = 0; i < this.numLine; ++i){
            //Draw vertical lines
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(
                new THREE.Vector3( (i + 0.5) * this.stride - 0.5 * this.width, 0.5 * this.height + 0.01, 0.5 * this.stride - 0.5 * this.width) );
            lineGeometry.vertices.push(
                new THREE.Vector3( (i + 0.5) * this.stride - 0.5 * this.width, 0.5 * this.height + 0.01, -0.5 * this.stride + 0.5 * this.width) );
            var line = new THREE.Line( lineGeometry, lineMaterial );
            this.chessboard.add(line);
        }
        for (var i = 0; i < this.numLine; ++i){
            //Draw vertical lines
            var lineGeometry = new THREE.Geometry();
            lineGeometry.vertices.push(
                new THREE.Vector3( 0.5 * this.stride - 0.5 * this.width, 0.5 * this.height + 0.01, (i + 0.5) * this.stride - 0.5 * this.width) );
            lineGeometry.vertices.push(
                new THREE.Vector3( -0.5 * this.stride + 0.5 * this.width, 0.5 * this.height + 0.01, (i + 0.5) * this.stride - 0.5 * this.width) );
            var line = new THREE.Line( lineGeometry, lineMaterial );
            this.chessboard.add(line);
        }
    }

    getChessPoint(camera){
        // this function return a list that contains all the points which map the scene position in 2D to the global position in 3D for chess points
        this.chessboard.updateMatrixWorld(true);
        camera.updateMatrixWorld(true);
        camera.updateProjectionMatrix();
        var viewMatrix = camera.matrixWorldInverse.clone();
        var projection = camera.projectionMatrix.clone();
        projection.multiply(viewMatrix);
        var modelWorld = this.chessboard.matrixWorld.clone();
        projection.multiply(modelWorld);

        /*var test = new THREE.Vector4(-933.2, 613.86, -800);
        test.applyMatrix4(projection);
        test.x = test.x / test.w;
        test.y = test.y / test.w;*/
        var pointList = []; // This list will store the points by column-major
        for (var i = 0; i < this.numLine; ++i){
            for (var j = 0; j < this.numLine; ++j){
                var local = new THREE.Vector4(
                    (i + 0.5) * this.stride - 0.5 * this.width, 0.5 * this.height, (j + 0.5) * this.stride - 0.5 * this.width, 1);
                var local1 = local.clone();
                local.applyMatrix4(modelWorld);
                // local1.applyMatrix4(modelWorld);
                // local1.applyMatrix4(viewMatrix);
                local1.applyMatrix4(projection);
                var point;
                if (local1.w != 0){
                    // When the points are in the scene, they will all fall in this group
                    point = new ChessPoint(
                        new THREE.Vector3(local.x, local.y, local.z), new THREE.Vector2(local1.x / local1.w, local1.y / local1.w));
                }else{
                    point = new ChessPoint(
                        new THREE.Vector3(local.x, local.y, local.z), new THREE.Vector2(local1.x, local1.y));
                }
                pointList.push(point);
            }
        }
        // console.log(pointList[0].scenePos.x);
        // console.log(pointList[0].scenePos.y);
        return pointList;
    }
}
