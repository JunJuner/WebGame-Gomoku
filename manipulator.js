// This file defines the model of manipulator

function degreeToRadian(degree){
    return degree * Math.PI / 180.0;
}

class Manipulator{
    constructor(scene, baseTranslateX, baseTranslateZ){
        // variables of manipulator
        this.q1 = degreeToRadian(90);
        this.q2 = degreeToRadian(-80);
        this.q3 = 0;
        // base
        this.baseRadius = 50;
        this.baseHeight = 150;
        var baseGeometry = new THREE.CylinderGeometry( this.baseRadius, this.baseRadius, this.baseHeight, 32 );
        var baseMaterial = new THREE.MeshPhongMaterial(
            {color: 0x808000, specular: 0x333333, shininess: 15});
        this.base = new THREE.Mesh(baseGeometry, baseMaterial);
        // The bottom of the base will at the floor
        this.base.translateY(this.baseHeight / 2);
        this.baseTranslateX = baseTranslateX;
        this.baseTranslateZ = baseTranslateZ;
        this.base.translateX(baseTranslateX);
        this.base.translateZ(baseTranslateZ);
        scene.add(this.base);

        // first link
        this.linkConnectionRadius = 50;
        this.linkConnectionHeight = 50;
        var linkAConnectionAGeometry = new THREE.CylinderGeometry( this.linkConnectionRadius, this.linkConnectionRadius, this.linkConnectionHeight, 32 );
        var linkAConnectionAMaterial = new THREE.MeshPhongMaterial(
            {color: 0xe02000, specular: 0x111111, shininess: 15});
        var linkAConnectionA = new THREE.Mesh(linkAConnectionAGeometry, linkAConnectionAMaterial);

        this.linkMiddleRadius = 20;
        this.linkALength = 360;
        var linkAMiddleGeometry = new THREE.CylinderGeometry( this.linkMiddleRadius, this.linkMiddleRadius, this.linkALength, 32 );
        var linkAMiddleMaterial = new THREE.MeshPhongMaterial(
            {color: 0x808000, specular: 0x333333, shininess: 15});
        var linkAMiddle = new THREE.Mesh(linkAMiddleGeometry, linkAMiddleMaterial);
        linkAMiddle.rotateZ(degreeToRadian(-90));
        linkAMiddle.translateY(this.linkALength / 2);

        var linkAConnectionBGeometry = new THREE.CylinderGeometry( this.linkConnectionRadius, this.linkConnectionRadius, this.linkConnectionHeight, 32 );
        var linkAConnectionBMaterial = new THREE.MeshPhongMaterial(
            {color: 0xa05000, specular: 0x111111, shininess: 15});
        var linkAConnectionB = new THREE.Mesh(linkAConnectionBGeometry, linkAConnectionBMaterial);
        linkAConnectionB.translateX(this.linkALength);

        this.linkA = new THREE.Group();
        this.linkA.add(linkAConnectionA);
        this.linkA.add(linkAMiddle);
        this.linkA.add(linkAConnectionB);
        this.linkA.translateY(this.baseHeight / 2 + this.linkConnectionHeight / 2);
        this.base.add(this.linkA);
        this.linkA.rotation.y = this.q1;

        // Second link
        var linkBConnectionAGeometry = new THREE.CylinderGeometry( this.linkConnectionRadius, this.linkConnectionRadius, this.linkConnectionHeight, 32 );
        var linkBConnectionAMaterial = new THREE.MeshPhongMaterial(
            {color: 0xe02000, specular: 0x111111, shininess: 15});
        var linkBConnectionA = new THREE.Mesh(linkBConnectionAGeometry, linkBConnectionAMaterial);

        this.linkBLength = 360;
        var linkBMiddleGeometry = new THREE.CylinderGeometry( this.linkMiddleRadius, this.linkMiddleRadius, this.linkBLength, 32 );
        var linkBMiddleMaterial = new THREE.MeshPhongMaterial(
            {color: 0x808000, specular: 0x333333, shininess: 15});
        var linkBMiddle = new THREE.Mesh(linkBMiddleGeometry, linkBMiddleMaterial);
        linkBMiddle.rotateZ(degreeToRadian(-90));
        linkBMiddle.translateY(this.linkBLength / 2);

        var linkBConnectionBGeometry = new THREE.CylinderGeometry( this.linkConnectionRadius, this.linkConnectionRadius, this.linkConnectionHeight, 32 );
        var linkBConnectionBMaterial = new THREE.MeshPhongMaterial(
            {color: 0xa05000, specular: 0x111111, shininess: 15});
        var linkBConnectionB = new THREE.Mesh(linkBConnectionBGeometry, linkBConnectionBMaterial);
        linkBConnectionB.translateX(this.linkBLength);

        this.linkB = new THREE.Group();
        this.linkB.add(linkBConnectionA);
        this.linkB.add(linkBMiddle);
        this.linkB.add(linkBConnectionB);
        this.linkB.translateX(this.linkALength);
        this.linkB.translateY(this.linkConnectionHeight);
        this.linkA.add(this.linkB);
        this.linkB.rotation.y = this.q2;

        // third link
        this.linkCRadius = 15;
        this.linkCHeight = 250;
        var linkCGeometry = new THREE.CylinderGeometry( this.linkCRadius, this.linkCRadius, this.linkCHeight, 32 );
        var linkCMaterial = new THREE.MeshPhongMaterial(
            {color: 0x800080, specular: 0x333333, shininess: 15});
        this.linkC = new THREE.Mesh(linkCGeometry, linkCMaterial);
        this.linkC.translateX(this.linkBLength);
        this.linkC.position.y = this.q3;
        this.linkB.add(this.linkC);

        // parameters for trajectory planning
        this.T = 3;
        this.dT = 0.01;
        this.endVelocity = []; // the array of end-effector endVelocity
        this.running = false; // To know that if it is in the state the manipulator is doing pick and place task
        this.index = 0; // the reference index in endVelocity array
        this.getChessIndex = 0;
        this.putChessIndex = 0;
        this.chess = null;
        this.place = null;
    }

    forwardKinematic(q1, q2, q3){
        var x = this.baseTranslateX + this.linkALength * Math.cos(q1) + this.linkBLength * Math.cos(q2 + q1);
        var y = this.baseHeight + 1.5 * this.linkConnectionHeight + q3 - 0.5 * this.linkCHeight;
        var z = this.baseTranslateZ - this.linkALength * Math.sin(q1) - this.linkBLength * Math.sin(q2 + q1);

        return new THREE.Vector3(x, y, z);
    }

    jacobianMatrix(q1, q2, q3){
        var j = new THREE.Matrix3();
        j.set(-this.linkALength * Math.sin(q1) - this.linkBLength * Math.sin(q2 + q1), -this.linkBLength * Math.sin(q1 + q2), 0,
                0, 0, 100,
            -this.linkALength * Math.cos(q1) - this.linkBLength * Math.cos(q2 + q1), -this.linkBLength * Math.cos(q1 + q2), 0);
        return j;
    }

    trajectoryPlanning(from, to){
        // from and to are both THREE.Vector3 which is the Catesian position of end-effector
        // In x and z direction, it will use a Quintic polynomial and in y direction, it will use a 4 + 4 polynomial.
        // It will add one point in y direction
        var total = this.T / this.dT;
        // x direction
        var dx = to.x - from.x;
        var vx = [];
        for (var i = 0.0; i <= total; ++i){
            vx.push(dx * (30 * Math.pow(i / total, 4) - 60 * Math.pow(i / total, 3) + 30 * Math.pow(i / total, 2)) / this.T);
        }
        // z direction
        var dz = to.z - from.z;
        var vz = [];
        for (var i = 0.0; i <= total; ++i){
            vz.push(dz * (30 * Math.pow(i / total, 4) - 60 * Math.pow(i / total, 3) + 30 * Math.pow(i / total, 2)) / this.T);
        }
        // y direction
        var middleY = 0.8 * (this.baseHeight + this.linkConnectionHeight);
        var vy = [];
        var a = 2 * from.y - middleY - to.y;
        var b = 2 * middleY - 3 * from.y + to.y;
        var yT = this.T / 2;
        var yTotal = yT / this.dT;
        for (var i = 0.0; i < yTotal; ++i){
            vy.push((4 * a * Math.pow(i / yTotal, 3) + 3 * b * Math.pow(i / yTotal, 2)) / yT);
        }
        a = 2 * to.y - middleY - from.y;
        b = 3 * from.y + 2 * middleY - 5 * to.y;
        var c = 3 * to.y - 3 * from.y;
        var d = from.y - 2 * middleY + to.y;
        for (var i = 0.0; i <= yTotal; ++i){
            vy.push((4 * a * Math.pow(i / yTotal, 3) + 3 * b * Math.pow(i / yTotal, 2) + 2 * c * (i / yTotal) + d) / yT);
        }

        // store all the reference in endVelocity
        for (var i = 0; i <= total; ++i){
            this.endVelocity.push(new THREE.Vector3(vx[i], vy[i], vz[i]));
        }
    }

    pickAndPlace(pick, place){
        // pick and place is the end-effector position
        this.endVelocity = [];
        this.index = 0;
        this.place = place;
        var nowPos = this.forwardKinematic(this.q1, this.q2, this.q3);
        this.trajectoryPlanning(nowPos, pick);
        for (var i = 0; i < 30; ++i){
            // let the manipulator stop there for a while
            this.endVelocity.push(new THREE.Vector3(0, 0, 0));
        }
        this.getChessIndex = this.endVelocity.length - 15;
        this.trajectoryPlanning(pick, place);
        for (var i = 0; i < 30; ++i){
            // let the manipulator stop there for a while
            this.endVelocity.push(new THREE.Vector3(0, 0, 0));
        }
        this.putChessIndex = this.endVelocity.length - 15;
        this.trajectoryPlanning(place, nowPos);
        this.running = true;
    }

    update(){
        if (this.running == false){
            // just stay there
            return 0;
        }
        var desiredV = this.endVelocity[this.index];
        ++this.index;

        // map to the desired velocity to joint space
        var jacobian = this.jacobianMatrix(this.q1, this.q2, this.q3);
        // measure the distance to singularity
        var dis = Math.min(this.q2 + Math.PI, Math.PI - this.q2, Math.abs(this.q2));
        if (dis < degreeToRadian(10)){
            // Damped Jacobian Inverse when near the singularity
            var lambda = 2 / dis;
            var transposeJacobian = jacobian.clone();
            transposeJacobian.transpose();
            jacobian.multiply(transposeJacobian);
            // add an Identity
            jacobian.elements[0] += lambda;
            jacobian.elements[4] += lambda;
            jacobian.elements[8] += lambda;
            jacobian.getInverse(jacobian);
            jacobian.multiplyMatrices(transposeJacobian, jacobian);
        }else{
            jacobian.getInverse(jacobian); // inverse the jacobianMatrix
        }

        // the matrix is column-major
        var dq1 = jacobian.elements[0] * desiredV.x + jacobian.elements[3] * desiredV.y + jacobian.elements[6] * desiredV.z;
        var dq2 = jacobian.elements[1] * desiredV.x + jacobian.elements[4] * desiredV.y + jacobian.elements[7] * desiredV.z;
        var dq3 = 100 * (jacobian.elements[2] * desiredV.x + jacobian.elements[5] * desiredV.y + jacobian.elements[8] * desiredV.z);

        this.q1 += dq1 * this.dT;
        this.q2 += dq2 * this.dT;
        this.q3 += dq3 * this.dT;

        // Constraint the angle to be (-PI, PI]
        while (this.q1 > Math.PI){
            this.q1 -= 2 * Math.PI;
        }
        while (this.q1 <= -Math.PI){
            this.q1 += 2 * Math.PI;
        }
        while (this.q2 > Math.PI){
            this.q2 -= 2 * Math.PI;
        }
        while (this.q2 <= -Math.PI){
            this.q2 += 2 * Math.PI;
        }

        // update the pose of manipulator
        this.linkA.rotation.y = this.q1;
        this.linkB.rotation.y = this.q2;
        this.linkC.position.y = this.q3;

        if (this.index == this.getChessIndex){
            return 1;
        }else if (this.index == this.putChessIndex) {
            return 2;
        }else if (this.index == this.endVelocity.length){
            // finish
            this.running = false;
            return 3;
        }else{
            return 0;
        }
    }

    bindChess(chess, chessHeight){
        this.linkC.add(chess);
        this.chess = chess;
        chess.position.y = -0.5 * (this.linkCHeight + chessHeight);
    }

    putDownChess(scene, chessHeight){
        scene.add(this.chess);
        this.chess.position.set(this.place.x, this.place.y + 0.5 * chessHeight, this.place.z);
        this.place = null;
        this.chess = null;
    }
}
