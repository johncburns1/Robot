////////////////////////////////////////////////////////////////////////////////
/*global THREE, Coordinates, document, window  */

//These are all of the shapes that are going to be made
var camera, scene, renderer;
var cameraControls;
var claw1, claw2;
var mirrorCamera1, mirrorCamera2;
var egg;
var foot1, foot2;
var hip1, hip2;
var hipplate1, hipplate2;
var neck, neckPiece1, neckPiece2;
var orb1, orb2;
var loader;
var crown;
var arm_joint;
var arm_segment;
var leg1, leg2;
var pad1, pad2
var clawShape;
var belt;
var left_shoe, right_shoe;

//object3d objects
var body;
var leg1_object, leg2_object;
var arm;
var crown_object;
var orb1_object, orb2_object;
var arm_segment_object;
var elbow_joint;
var claw1_joint, claw2_joint;
var belt_object;
var shoe1_object, shoe2_object;
var hip1_object, hip2_object;

//AxisHelper
var xAxis = new THREE.Vector3(1,0,0);
var yAxis = new THREE.Vector3(0,1,0);
var zAxis = new THREE.Vector3(0,0,1);

//clock, keyboard, and distance.  These are going to help us with making the robot walk
var clock = new THREE.Clock();
var keyboard = new KeyboardState();
var distance = 0;

//set up GUI controls
var controls, gui;

//fillScene
function fillScene() {

	//initialize scene
	scene = new THREE.Scene();

	//gui for controls
	gui = new dat.GUI({
		autoPlace: false,
		height : (32 * 1)- 1
	});
	controls = {
		Swivel: 0,
		Bend: 0,
		Grab: 0,
		Misc: 0,
	};

	//set the GUI controls
	gui.add(controls, 'Swivel', -130, 130);
	gui.add(controls, 'Bend', -30, 30);
	gui.add(controls, 'Grab', 0, 10);
	gui.add(controls, 'Misc', 0, 1);

	//set the position on the window
	gui.domElement.style.position = "relative";
	gui.domElement.style.top = "-700px";
	gui.domElement.style.left = "450px";

	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.DirectionalLight( 0xffffff, 0.7 );
	light.position.set( 200, 500, 500 );

	scene.add( light );

	light = new THREE.DirectionalLight( 0xffffff, 0.9 );
	light.position.set( -200, -100, -400 );

	scene.add( light );

 //grid xz
 var gridXZ = new THREE.GridHelper(2000, 100, new THREE.Color(0xCCCCCC), new THREE.Color(0x888888));
 scene.add(gridXZ);

 //axes
 var axes = new THREE.AxisHelper(150);
 axes.position.y = 1;
 scene.add(axes);

	//call drawRobot
 drawRobot();
}

//drawRobot
function drawRobot() {

	//////////////////////////////
	// MATERIALS/////////////////
	////////////////////////////


	//a metalic green
	var bodyMaterial = new THREE.MeshPhongMaterial({
		color: 0x003300,
		specular: 0xffffff,
		shininess: 30,
		metal: true,
    shading: THREE.FlatShading
	});

	//a matte black
	var bodyMaterial2 = new THREE.MeshPhongMaterial({
		color: 0x000000,
		shading: THREE.FlatShading
	});

	//a transparent black
	var eggMaterial = new THREE.MeshLambertMaterial({
		color: 0x000000,
		transparent: true,
		opacity: 0.25
	});

	//a reflective maroon
	var orbMaterial1 = new THREE.MeshPhongMaterial({
		color: 0x800000,
		shininess: true,
		specular: 0x800000
	});

	//a reflective maroon
	var orbMaterial2 = new THREE.MeshPhongMaterial({
		color: 0x800000,
		shininess: true,
		specular: 0x800000
	});

	//reflective gold
	var reflectiveMaterial1 = new THREE.MeshPhongMaterial({
		color: 'gold',
		shininess: true,
		specular: 'gold'
	});

	//reflective gold
	var reflectiveMaterial2 = new THREE.MeshPhongMaterial({
		color: 'gold',
		shininess: true,
		specular: 'gold'
	});

	//for the imported blender .obj(s)
	var graytex = new THREE.Texture();

	//create a new shape for the ExtrudeGeometry
	clawShape = new THREE.Shape();
	clawShape.moveTo(225, 160);
	clawShape.lineTo(200, 150);
	clawShape.lineTo(200, 175);
	clawShape.lineTo(275, 190);

	//the object manager that loads the blender objects
	var manager = new THREE.LoadingManager();
	manager.onProgress = function ( item, loaded, total ) {
		console.log( item, loaded, total );
	};

	//do this when the loading of blender objects is in progress
	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	var onError = function ( xhr ) {
	};

	///////////
	//skybox///
	///////////
	var materialArray = [];

	//push the loaded images in into an array
	materialArray.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('airport/sky-xpos.png')}));
	materialArray.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('airport/sky-xneg.png')}));
	materialArray.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('airport/sky-ypos.png')}));
	materialArray.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('airport/sky-yneg.png')}));
	materialArray.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('airport/sky-zpos.png')}));
	materialArray.push(new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture('airport/sky-zneg.png')}));

	//push materials from the array into a THREE.BackSide
	for(var i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;

	//set the material and the geometry for the skybox
	var skyboxMaterial = new THREE.MeshFaceMaterial(materialArray);
	var skyboxGeom = new THREE.CubeGeometry(3000, 2750, 3000, 100, 100, 100);

	//set the mesh and position the box
	var skybox = new THREE.Mesh(skyboxGeom, skyboxMaterial);
	skybox.position.set(0, 600, 0);

	//add the skybox to the scene
	scene.add(skybox);

	/////////////////////////////////////////////////////////////////
	/////body object and all immediately connected body objects/////
	///////////////////////////////////////////////////////////////

	//Body object.  This is the top of our object hierarchy
	body = new THREE.Object3D();

	//the egg shaped body
	egg = new THREE.Mesh(
		new THREE.SphereGeometry(80, 20, 20), eggMaterial);
	egg.applyMatrix( new THREE.Matrix4().makeScale( 1.75, 2.25, 1.75 ) );
	body.add(egg);
	egg.position.y = 400;

	//the pads on the sides
	pad1 = new THREE.Mesh(
		new THREE.BoxGeometry(100, 100, 20), bodyMaterial);
	pad1.rotateOnAxis(yAxis, Math.PI/2);
	body.add(pad1);
	pad1.position.x = -140;
	pad1.position.y = 400;

	pad2 = new THREE.Mesh(
		new THREE.BoxGeometry(100, 100, 20), bodyMaterial);
	pad2.rotateOnAxis(yAxis, Math.PI/2);
	body.add(pad2);
	pad2.position.x = 140;
	pad2.position.y = 400;

	//belt
	belt_object = new THREE.Object3D();
	belt = new THREE.Mesh(
		new THREE.TorusGeometry(150, 20, 20, 20, Math.PI *2), reflectiveMaterial1);
	belt.rotateOnAxis(xAxis, Math.PI/2);

	belt_object.add(belt);
	body.add(belt_object);

	belt.position.y = 300;

	//neck
	neck = new THREE.Mesh(
		new THREE.TorusGeometry(60, 20, 20, 20, Math.PI * 2), bodyMaterial);
	neck.rotateOnAxis(xAxis, Math.PI/2);
	body.add(neck);
	neck.position.y = 550;

	neckPiece1 = new THREE.Mesh(
			new THREE.TorusGeometry(40, 20, 20, 20, Math.PI * 2), reflectiveMaterial1);
	neckPiece1.rotateOnAxis(xAxis, Math.PI/2);
	body.add(neckPiece1);
	neckPiece1.position.y = 575;

	neckPiece2 = new THREE.Mesh(
			new THREE.TorusGeometry(25, 20, 20, 20, Math.PI * 2), bodyMaterial);
	neckPiece2.rotateOnAxis(xAxis, Math.PI/2);
	body.add(neckPiece2);
	neckPiece2.position.y = 600;

	//floating orbs on side
	orb1_object = new THREE.Object3D();
	orb1 = new THREE.Mesh(
		new THREE.SphereGeometry(30, 20, 20), orbMaterial1);
	orb1_object.add(orb1);
	orb1.position.set(200, 400, 0);


	orb2_object = new THREE.Object3D();
	orb2 = new THREE.Mesh(
		new THREE.SphereGeometry(30, 20, 20), orbMaterial2);
	orb2_object.add(orb2);
	orb2.position.set(-200, 400, 0);

	body.add(orb1_object, orb2_object);

	////////////////////////
	/////make the legs/////
	//////////////////////

	leg1_object = new THREE.Object3D();
	leg1_object.position.x = -75;
	leg1_object.position.y = 210;

	//make the hip and shoe objects
	hip1_object = new THREE.Object3D();
	shoe1_object = new THREE.Object3D();
	shoe2_object = new THREE.Object3D();

	//hip1
	hip1 = new THREE.Mesh(
		new THREE.OctahedronGeometry(50, 1), bodyMaterial);
	hip1_object.add(hip1);

	leg1 = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 20, 150), bodyMaterial);
	hip1_object.add(leg1);
	leg1.position.y = -90;

	//feet
	foot1 = new THREE.Mesh(
		new THREE.SphereGeometry(70, 20, 20, 0, Math.PI * 2, 0, Math.PI/2), bodyMaterial2);
	hip1_object.add(foot1);
	foot1.position.y = -210;

	//shoes
	left_shoe = new THREE.Mesh(
		new THREE.TorusGeometry(30, 20, 20, 20, Math.PI *2), reflectiveMaterial1);
	left_shoe.rotateOnAxis(xAxis, Math.PI/2);
	shoe1_object.add(left_shoe);
	left_shoe.position.y = -135;

	//add to the object hierarchy
	hip1_object.add(shoe1_object);
	leg1_object.add(hip1_object);
	body.add(leg1_object);

	//the left leg
	leg2_object = new THREE.Object3D();
	leg2_object.position.x = 75;
	leg2_object.position.y = 210;

	//hip and shoe objects
	hip2_object = new THREE.Object3D();
	shoe2_object = new THREE.Object3D();

	//hip2
	hip2 = new THREE.Mesh(
		new THREE.OctahedronGeometry(50, 1), bodyMaterial);
	hip2_object.add(hip2);

	//leg2
	leg2 = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 20, 150), bodyMaterial);
	hip2_object.add(leg2);
	leg2.position.y = -90;

	//foot2
	foot2 = new THREE.Mesh(
		new THREE.SphereGeometry(70, 20, 20, 0, Math.PI * 2, 0, Math.PI/2), bodyMaterial2);
	hip2_object.add(foot2);
	foot2.position.y = -210;

	//right_shoe
	right_shoe = new THREE.Mesh(
		new THREE.TorusGeometry(30, 20, 20, 20, Math.PI *2), reflectiveMaterial1);
	right_shoe.rotateOnAxis(xAxis, Math.PI/2);
	right_shoe.position.y = -135;
	shoe2_object.add(right_shoe);

	//add the objects to the hierarchy
	hip2_object.add(shoe2_object);
	leg2_object.add(hip2_object);
	body.add(leg2_object);

	//////////////
	/////arm/////
	////////////
	arm = new THREE.Object3D();
	arm.position.set(0, 400, 125);

	//where the arm is going to Bend
	elbow_joint = new THREE.Object3D();
	elbow_joint.position.z = 215;

	//arm joint connected to the main body
	arm_joint = new THREE.Mesh(
		new THREE.SphereGeometry(50, 20, 20, 0, Math.PI * 2, 0, Math.PI/2), bodyMaterial2);
	arm_joint.rotateOnAxis(xAxis, Math.PI/2);
	arm.add(arm_joint);

	//arm segment
	arm_segment = new THREE.Mesh(
		new THREE.CylinderGeometry(10, 20, 150), bodyMaterial2);
	arm_segment.rotateOnAxis(xAxis, -Math.PI/2);
	arm.add(arm_segment);
	arm_segment.position.z = 120;

	//the elbow
	elbow = new THREE.Mesh(
		new THREE.SphereGeometry(15, 20, 20), bodyMaterial2);
	elbow_joint.add(elbow);

	//add the arm object from blender
	loader = new THREE.OBJLoader( manager );
	loader.load('arm.obj', function(object) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = graytex;
				child.receiveShadow = true;
			}
		} );
		object.rotateOnAxis(xAxis, -Math.PI/2);
		object.position.z = 160;
		elbow_joint.add(object);
	});

	//Top half of the claw
	claw1_joint = new THREE.Object3D();
	claw1 = new THREE.Mesh(
		new THREE.ExtrudeGeometry(clawShape, {amount: 50, bevelEnabled: true}), reflectiveMaterial1);
	claw1.rotateOnAxis(yAxis, -Math.PI/2);
	claw1_joint.add(claw1);
	claw1.position.x = 25;
	claw1.position.y = -195;
	claw1.position.z = -20;

	//bottom half of the claw
	claw2_joint = new THREE.Object3D();
	claw2 = new THREE.Mesh(
		new THREE.ExtrudeGeometry(clawShape, {amount: 50, bevelEnabled: true}), reflectiveMaterial2);
	claw2.rotateOnAxis(yAxis, -Math.PI/2);
	claw2.rotateOnAxis(xAxis, -Math.PI);
	claw2_joint.add(claw2);
	claw2.position.x = -25;
	claw2.position.y = 190;
	claw2.position.z = -20;

	//add object to the object hierarchy
	elbow_joint.add(claw1_joint, claw2_joint);
	arm.add(elbow_joint);
	body.add(arm);

	//load the crown
	crown_object = new THREE.Object3D();
	loader = new THREE.OBJLoader( manager );
	loader.load('crown1.obj', function(object) {
		object.traverse( function ( child ) {
			if ( child instanceof THREE.Mesh ) {
				child.material.map = graytex;
				child.receiveShadow = true;
			}
		} );

		object.position.set(-12.5, 645, 8);
		crown_object.add(object);
	});

	//add the crown object
	body.add(crown_object);

	//set the envMap for the reflective materials and set the cameras

	//envMap on the claws
	mirrorCamera1 = new THREE.CubeCamera( 0.1, 5000, 512 );
	scene.add(mirrorCamera1);
	reflectiveMaterial1.envMap = mirrorCamera1.renderTarget;
	mirrorCamera1.position = claw1.position;

	mirrorCamera2 = new THREE.CubeCamera( 0.1, 5000, 512 );
	scene.add(mirrorCamera2);
	reflectiveMaterial2.envMap = mirrorCamera2.renderTarget;
	mirrorCamera2.position = claw2.position;

	//envMap on the floating orbs
	mirrorCamera3 = new THREE.CubeCamera( 0.1, 5000, 512 );
	scene.add(mirrorCamera3);
	orbMaterial1.envMap = mirrorCamera3.renderTarget;
	mirrorCamera3.position = orb1.position;

	mirrorCamera4 = new THREE.CubeCamera( 0.1, 5000, 512 );
	scene.add(mirrorCamera4);
	orbMaterial2.envMap = mirrorCamera4.renderTarget;
	mirrorCamera4.position = orb2.position;

	//add the final object to the scene
	scene.add(body);
}

function init() {

	//dimensions of the canvas
	var canvasWidth = 700;
	var canvasHeight = 700;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColor( 0xAAAAAA, 1.0 );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 75, canvasRatio, 1, 4000 );

	// CONTROLS
	cameraControls = new THREE.OrbitControls(camera, renderer.domElement);
	camera.position.set( -800, 600, -500);
	cameraControls.target.set(4,301,92);
}

//render the gui and the canvas
function addToDOM() {
    var canvas = document.getElementById('canvas');
    canvas.appendChild(renderer.domElement);
		canvas.appendChild(gui.domElement);
}

//initialize step for the animation controls
var step = 0;

//animate
function animate() {

	//rotate the crown
	crown_object.rotation.y += 0.5*controls.Misc;

	//move the orb objects
	step += controls.Misc;
	orb1_object.position.x = (75 * Math.abs(Math.sin(step)));
	orb2_object.position.x = -(75 * Math.abs(Math.sin(step)));

	//rotate arm
	arm.rotation.z = 0.02*controls.Swivel;

	//bend arm
	elbow_joint.rotation.x = 0.05*controls.Bend;

	//clamp the claws
	claw1_joint.rotation.x = 0.01*controls.Grab;
	claw2_joint.rotation.x = -0.01*controls.Grab;

	//make the shoes move
	shoe1_object.position.y = (75 * Math.abs(Math.sin(step)));
	shoe2_object.position.y = (75 * Math.abs(Math.sin(step)));

	//make the belt move
	belt_object.position.y = (150 * Math.abs(Math.sin(step)));

	//////////////////////////////////////
	////Move the robot on a keystroke/////
	//////////////////////////////////////
	//update the keyboard before
	keyboard.update();

	//while A, D, or W are pressed
	if(keyboard.pressed("A") || keyboard.pressed("D") || keyboard.pressed("W")) {

		//elapsed time since last press
		elapsedTime = clock.getElapsedTime() + 1;

		//creates an oscillating motion of the legs
		hip1_object.rotation.x = (5 * (Math.sin(elapsedTime)) / 10);
		hip2_object.rotation.x = -(5 * (Math.sin(elapsedTime)) / 10);

		//if W was pressed
		if(keyboard.pressed("W")) {

			//distance of each step
			distance = 6;

			//move forward in the local z direction of the object
			body.translateZ(distance);
		}

		//if "C" is pressed, rotate to the left around the yAxis
		else if(keyboard.pressed("A")) body.rotateOnAxis(yAxis, Math.PI / 36);

		//if "D" is pressed, rotate to the right around the yAxis
		else body.rotateOnAxis(yAxis, -Math.PI / 36);
	}

	//update the keyboard after
	keyboard.update();

	//animate and call the render loop
	window.requestAnimationFrame(animate);
	render();
}

//render
function render() {

	//update camerControls, the keyboard, and get change in time
	var delta = clock.getDelta();
	cameraControls.update(delta);
	keyboard.update();

	//for the reflective materials, we need to make sure that when we take the image to reflect,
	//it is not being covered by the object itself

	//update claw Mesh
	claw1.visible = false;
	mirrorCamera1.updateCubeMap( renderer, scene );
	claw1.visible = true;

	claw2.visible = false;
	mirrorCamera2.updateCubeMap( renderer, scene );
	claw2.visible = true;

	//update belt mesh
	belt.visible = false;
	mirrorCamera1.updateCubeMap( renderer, scene );
	belt.visible = true;

	//update shoe meshes
	left_shoe.visible = false;
	mirrorCamera1.updateCubeMap( renderer, scene );
	left_shoe.visible = true;

	right_shoe.visible = false;
	mirrorCamera1.updateCubeMap( renderer, scene );
	right_shoe.visible = true;

	//update neck mesh
	neckPiece1.visible = false;
	mirrorCamera1.updateCubeMap( renderer, scene );
	neckPiece1.visible = true;

	//update orb mesh
	orb1.visible = false;
	mirrorCamera3.updateCubeMap( renderer, scene );
	orb1.visible = true;

	orb2.visible = false;
	mirrorCamera4.updateCubeMap( renderer, scene );
	orb2.visible = true;

	//render the scene
	renderer.render(scene, camera);
}

//execute
try {
  init();
  fillScene();
  addToDOM();
  animate();
} catch(error) {
    console.log("Your program encountered an unrecoverable error, can not draw on canvas. Error was:");
    console.log(error);
}
