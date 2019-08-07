// The scene before or after the game
var firstScene = new THREE.Scene();
var orthoCamera = new THREE.OrthographicCamera(-1000, 1000, 400, -400, 0.1, 500);

var loader = new THREE.FontLoader();
loader.load('fonts/helvetiker_regular.typeface.json', function(font){
	var textGeometry1 = new THREE.TextGeometry( "You first", {
			font: font,
			size: 70,
			height: 20,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 8,
			bevelOffset: 0,
			bevelSegments: 5
		} );
	var textMaterial = new THREE.MeshBasicMaterial({color: 0xff5555});
	var textMesh1 = new THREE.Mesh(textGeometry1, textMaterial);
	textMesh1.position.set(-500, -50, -200);
	firstScene.add(textMesh1);

	var textGeometry2 = new THREE.TextGeometry( "Agent first", {
			font: font,
			size: 70,
			height: 20,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 8,
			bevelOffset: 0,
			bevelSegments: 5
		} );
	var textMesh2 = new THREE.Mesh(textGeometry2, textMaterial);
	textMesh2.position.set(0, -50, -200);
	firstScene.add(textMesh2);

	var textGeometry3 = new THREE.TextGeometry( "Gomoku with Robot", {
			font: font,
			size: 90,
			height: 20,
			curveSegments: 12,
			bevelEnabled: true,
			bevelThickness: 10,
			bevelSize: 8,
			bevelOffset: 0,
			bevelSegments: 5
		} );
	var textMaterial2 = new THREE.MeshBasicMaterial({color: 0x0022ff});
	var textMesh3 = new THREE.Mesh(textGeometry3, textMaterial2);
	textMesh3.position.set(-600, 150, -200);
	firstScene.add(textMesh3);
});

var state = 0;
var raycaster = new THREE.Raycaster();

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
// camera.layers.set(1);

var renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var cameraDis = 620;
var cameraPhi = 0.0;
var cameraTheta = 1.35;
// camera.position.z = 150;
// camera.position.y = 600;
camera.position.set(cameraDis * Math.cos(cameraTheta) * Math.sin(cameraPhi),
	cameraDis * Math.sin(cameraTheta), cameraDis * Math.cos(cameraTheta) * Math.cos(cameraPhi));
// camera.lookAt(new THREE.Vector3(0,0,0));
camera.rotation.set(-cameraTheta, cameraPhi, 0, 'YXZ');

// add objects
var chessboard = new Chessboard(scene);
var pointList = chessboard.getChessPoint(camera);

var robot = new Manipulator(scene, -400, 50);

var chessBox = new ChessBox(scene, -400, -100);

// var initialTurn = false;
// var agent = new Agent(chessboard.numLine, initialTurn, pointList, robot);
// var playerCanClick = !initialTurn;

var agent;
var chooseR, chooseC;
var chessList = [];

// add light
var ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);
var pointLight1 = new THREE.PointLight(0xffffff, 1, 0);
pointLight1.position.set(-600, 600, -600);
scene.add(pointLight1);
var pointLight2 = new THREE.PointLight(0xffffff, 1, 0);
pointLight2.position.set(600, 600, -600);
scene.add(pointLight2);

// robot.pickAndPlace(new THREE.Vector3(-400, 70, -100), new THREE.Vector3(-220, 100 + chessBox.scale * chessBox.radius, 220));

// Add pop-up GUI
var viewParams = {distance: cameraDis, theta: cameraTheta, phi: cameraPhi};
var gui = new dat.GUI();

var f1 = gui.addFolder('Change View Pose');
f1.add(viewParams, 'distance', 500, 800).onFinishChange(function(value){
	cameraDis = value;
	camera.position.set(cameraDis * Math.cos(cameraTheta) * Math.sin(cameraPhi),
		cameraDis * Math.sin(cameraTheta), cameraDis * Math.cos(cameraTheta) * Math.cos(cameraPhi));
	camera.rotation.set(-cameraTheta, cameraPhi, 0, 'YXZ');
	// camera.lookAt(new THREE.Vector3(0,0,0));
	pointList = chessboard.getChessPoint(camera);
	agent.updatePointList(pointList);
});
f1.add(viewParams, 'theta', -3.14, 3.14).onFinishChange(function(value){
	cameraTheta = value;
	camera.position.set(cameraDis * Math.cos(cameraTheta) * Math.sin(cameraPhi),
		cameraDis * Math.sin(cameraTheta), cameraDis * Math.cos(cameraTheta) * Math.cos(cameraPhi));
	camera.rotation.set(-cameraTheta, cameraPhi, 0, 'YXZ');
	// camera.lookAt(new THREE.Vector3(0,0,0));
	pointList = chessboard.getChessPoint(camera);
	agent.updatePointList(pointList);
});
f1.add(viewParams, 'phi', -3.14, 3.14).onFinishChange(function(value){
	cameraPhi = value;
	camera.position.set(cameraDis * Math.cos(cameraTheta) * Math.sin(cameraPhi),
		cameraDis * Math.sin(cameraTheta), cameraDis * Math.cos(cameraTheta) * Math.cos(cameraPhi));
	camera.rotation.set(-cameraTheta, cameraPhi, 0, 'YXZ');
	// camera.lookAt(new THREE.Vector3(0,0,0));
	pointList = chessboard.getChessPoint(camera);
	agent.updatePointList(pointList);
});
dat.GUI.toggleHide();

var animate = function () {
	requestAnimationFrame( animate );
	if (state == 0){
		renderer.render( firstScene, orthoCamera );
		return;
	}
	// chessboard.rotation.z += 0.01;
	var i = robot.update();
	if (i == 1){
		// robot get the chess
		var chess = chessBox.provideChess();
		chessList.push(chess);
		robot.bindChess(chess, chessBox.scale * chessBox.radius);
	}
	if (i == 2){
		robot.putDownChess(scene, chessBox.scale * chessBox.radius);
	}
	if (i == 3){
		// finish the whole path
		var check = agent.checkWin(chooseR, chooseC);
		if (check == 1){
			window.alert('Sorry. Agent Wins!');
			state = 0;
			for (var i = 0; i < chessList.length; ++i){
				scene.remove(chessList[i]);
			}
			chessList = [];
			dat.GUI.toggleHide();
		}else if (check == 0){
			window.alert('Draw. Try again!');
			state = 0;
			for (var i = 0; i < chessList.length; ++i){
				scene.remove(chessList[i]);
			}
			chessList = [];
			dat.GUI.toggleHide();
		}
		agent.agentTurn = false;
	}
	chessBox.update();
	renderer.render( scene, camera );
};

function onMouseClick(event){
	var mouse = new THREE.Vector2();
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
	if (state == 0){
		raycaster.setFromCamera(mouse, orthoCamera);
		var intersect = raycaster.intersectObjects(firstScene.children);
		if (intersect.length > 0){
			var s = intersect[0].object.geometry.parameters.text;
			if (s == "You first"){
				agent = new Agent(chessboard.numLine, false, pointList, robot);
				state = 1;
				dat.GUI.toggleHide();
			}else if (s == "Agent first"){
				agent = new Agent(chessboard.numLine, true, pointList, robot);
				state = 1;
				dat.GUI.toggleHide();
				var pos = agent.chooseNextStep();
				chooseR = pos[0];
				chooseC = pos[1];
			}
		}
		return;
	}
	if (agent.agentTurn == true){
		// agent turn. Don't react to the click
		return;
	}

	var minIndex = 0;
	var minDis = 200;
	for (var i = 0; i < pointList.length; ++i){
		var dis = mouse.distanceTo(pointList[i].scenePos);
		if (dis < minDis){
			minIndex = i;
			minDis = dis;
		}
	}
	// console.log(minDis);
	if (minDis < 0.1){
		var row = minIndex % chessboard.numLine;
		var col = Math.floor(minIndex / chessboard.numLine); // pointList is column major
		if (agent.map[row][col] != 0){
			// this position has been occupied. Do nothing
			return;
		}
		agent.map[row][col] = 2;
		// robot.pickAndPlace(new THREE.Vector3(-400, 70, -100), pointList[minIndex].globalPos);
		var chess = getChess(!chessBox.white, chessBox.radius, chessBox.scale);
		scene.add(chess);
        chess.position.set(
			pointList[minIndex].globalPos.x, pointList[minIndex].globalPos.y + 0.5 * chessBox.radius * chessBox.scale, pointList[minIndex].globalPos.z);
		chooseR = row;
		chooseC = col;
		chessList.push(chess);
		var check = agent.checkWin(chooseR, chooseC);
		if (check == 1){
			window.alert('Congratulation! You win.');
			state = 0;
			for (var i = 0; i < chessList.length; ++i){
				scene.remove(chessList[i]);
			}
			chessList = [];
			dat.GUI.toggleHide();
			return;
		}else if (check == 0){
			window.alert('Draw. Try again!');
			state = 0;
			for (var i = 0; i < chessList.length; ++i){
				scene.remove(chessList[i]);
			}
			chessList = [];
			dat.GUI.toggleHide();
			return;
		}
		var pos = agent.chooseNextStep();
		chooseR = pos[0];
		chooseC = pos[1];
		agent.agentTurn = true;
	}
}

window.addEventListener( 'click', onMouseClick );
animate();
