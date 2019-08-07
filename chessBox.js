// this file define the class which provides the chess and chess BoxGeometry

function getChess(white, radius, scale){
    // this function will generate a chess. white is a boolean variable. white = false means this is a black chess
    var geometry = new THREE.SphereGeometry(radius, 32, 24);
    var material;
    if (white == true){
        material = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0xbbbbbb, shininess: 20});
    }else{
        material = new THREE.MeshPhongMaterial({color: 0x000000, specular: 0xbbbbbb, shininess: 20});
    }
    var sphere = new THREE.Mesh( geometry, material );
    sphere.scale.y = scale;
    return sphere;
}

class ChessBox{
    constructor(scene, offsetX, offsetZ){
        this.height = 60; // chess box
        this.radius = 16; // chess radius
        this.scale = 0.4; // chess scale in y direction
        this.white = true;
        var geometry = new THREE.BoxGeometry(80, this.height, 80);
        var material = new THREE.MeshPhongMaterial({color: 0x10e010, specular: 0x228822, shininess: 20});
        this.cube = new THREE.Mesh(geometry, material);
        this.cube.position.set(offsetX, this.height / 2, offsetZ);
        scene.add(this.cube);
        // get one chess
        this.chess = getChess(this.white, this.radius, this.scale);
        // this.white = !this.white; // next time we want a black chess.
        this.chess.position.y = 0.5 * this.height + 0.5 * this.scale * this.radius;
        this.cube.add(this.chess);

        this.total = 200;
        this.index = 0;
        this.running = false;
    }

    provideChess(){
        this.running = true;
        var chess = this.chess;
        this.chess = getChess(this.white, this.radius, this.scale);
        // this.white = !this.white;
        this.cube.add(this.chess);
        this.index = 0;
        return chess;
    }

    update(){
        if (this.running == false){
            return;
        }
        // let the chess to move up
        var path = 0.5 * (this.height + this.scale * this.radius);
        ++this.index;
        if (this.index == this.total){
            this.running = false;
        }
        this.chess.position.y = path * (this.index / this.total);
    }
}
