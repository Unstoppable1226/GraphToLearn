import { Injectable } from '@angular/core';
import { Formatter } from '../tools/app.formatter'

declare var BABYLON: any;
declare var Button: any;

@Injectable()
export class Manager3D {
	private canvas
	private engine
	private scene
	private wordSearch
	private sphereMaterial
	private spheres = []
	private advancedTexture = {addControl: function(label){}}
	private camera
	private advancedTextureGUI
	private panel3
	private header
	private info

	constructor(private _format : Formatter) {}

	startEngine(nameElement){
		this.canvas = document.getElementById(nameElement);
		this.engine = new BABYLON.Engine(this.canvas, true);
	}

	createLabel(mesh) {
		var label = new BABYLON.GUI.Rectangle("label for " + mesh.name);
		label.background = "transp"
		label.height = "30px";
		label.alpha = 0.5;
		label.width = mesh.name.length > 11 ? "200px" : "100px";
		label.cornerRadius = 20;
		label.thickness = 1;
		label.linkOffsetY = 30;
		this.advancedTexture.addControl(label); 
		label.linkWithMesh(mesh);

		var text1 = new BABYLON.GUI.TextBlock();
		text1.text = mesh.name;
		text1.color = "black";
		label.addControl(text1); 
	}

	createInformation(mesh) {
		// Another GUI on the right
		this.advancedTextureGUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		this.advancedTextureGUI.layer.layerMask = 5;
		this.panel3 = new BABYLON.GUI.StackPanel();
		this.panel3.width = "80%";
		this.panel3.heigth = "400px";
		this.panel3.fontSize = "20px";
		this.panel3.fontFamily = "font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;"

		this.panel3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		this.panel3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.panel3.top = "150"

		this.header = new BABYLON.GUI.TextBlock();
		this.header.text = "Informations concernant : " + mesh.name;
		this.header.height = "40px";
		this.header.color = "black";
		this.header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.header.paddingTop = "10px";
		this.advancedTextureGUI.addControl(this.panel3);
		this.panel3.addControl(this.header); 

		this.info = new BABYLON.GUI.TextBlock();
		this.info.text = "Type : " + this.wordSearch.type + "\n" + "Explications : " + "\n" + this.wordSearch.explications;
		this.info.textWrapping = true;
		this.info.height = "200px";
		this.info.color = "#333";
		this.info.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.info.paddingTop = "10px";
		this.panel3.addControl(this.info); 

		var result = new BABYLON.GUI.Button("aimer");
		result.width = "150px"
		result.height = "50px"
		// Adding text
		var textBlock = new BABYLON.GUI.TextBlock(name + "_button", "Aimer");
		textBlock.textWrapping = true;
		textBlock.color = "black"
		textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		textBlock.paddingLeft = "25%";
		result.addControl(textBlock);   

		// Adding image
		var iconImage = new BABYLON.GUI.Image(name + "_icon", "../assets/images/heart.png");
		iconImage.width = "40%";
		iconImage.stretch = BABYLON.GUI.Image.STRETCH_FILL;
		iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		result.addControl(iconImage);            

		this.panel3.addControl(result); // Another GUI on the right
		this.advancedTextureGUI = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
		this.advancedTextureGUI.layer.layerMask = 5;
		this.panel3 = new BABYLON.GUI.StackPanel();
		this.panel3.width = "80%";
		this.panel3.heigth = "400px";
		this.panel3.fontSize = "20px";
		this.panel3.fontFamily = "font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;"

		this.panel3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		this.panel3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
		this.panel3.top = "150"

		this.header = new BABYLON.GUI.TextBlock();
		this.header.text = "Informations concernant : " + mesh.name;
		this.header.height = "40px";
		this.header.color = "black";
		this.header.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.header.paddingTop = "10px";
		this.advancedTextureGUI.addControl(this.panel3);
		this.panel3.addControl(this.header); 

		this.info = new BABYLON.GUI.TextBlock();
		this.info.text = "Type : " + this.wordSearch.type + "\n" + "Explications : " + "\n" + this.wordSearch.explications;
		this.info.textWrapping = true;
		this.info.height = "200px";
		this.info.color = "#333";
		this.info.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		this.info.paddingTop = "10px";
		this.panel3.addControl(this.info); 

		var result = new BABYLON.GUI.Button("aimer");
		result.width = "150px"
		result.height = "50px"
		// Adding text
		var textBlock = new BABYLON.GUI.TextBlock(name + "_button", "Aimer");
		textBlock.textWrapping = true;
		textBlock.color = "black"
		textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
		textBlock.paddingLeft = "25%";
		result.addControl(textBlock);   

		// Adding image
		var iconImage = new BABYLON.GUI.Image(name + "_icon", "../assets/images/heart.png");
		iconImage.width = "40%";
		iconImage.stretch = BABYLON.GUI.Image.STRETCH_FILL;
		iconImage.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
		result.addControl(iconImage);            

		this.panel3.addControl(result); 
	}

	moveCameraToMesh(mesh) {
		this.camera.lockedTarget = mesh;
		this.camera.radius = mesh.name == this.wordSearch.name ? 70 : 100; // how far from the object to follow
		this.camera.maxCameraSpeed = 10
	}

	registerAction(mesh) {
		let instance = this;
		mesh.actionManager = new BABYLON.ActionManager(this.scene);
		mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (function(mesh) {
			if (instance.advancedTextureGUI == undefined) {
				instance.createInformation(mesh);
			} else {
				instance.header.text = "Informations concernant : " + mesh.name;
			}
			instance.moveCameraToMesh(mesh)
			
		}).bind(this, mesh)));
	}

	createScene(wordSearch, tags){
		this.wordSearch = wordSearch;
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color4(0,0,0,0.0000000000000001); 
		this.camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, 1.0, 110, BABYLON.Vector3.Zero(),this.scene);
		this.camera.attachControl(this.canvas, true);
		var hemi = new BABYLON.HemisphericLight("toto");
		var sphereMaterial = new BABYLON.StandardMaterial();
		this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");
		
		var sphere1 = BABYLON.Mesh.CreateSphere(wordSearch.name, 50.0, 15, this.scene);

		var label = new BABYLON.GUI.Rectangle("label for " + sphere1.name);
		label.background = "white"
		label.height = "30px";
		label.alpha = 2;
		label.width = "100px";
		label.cornerRadius = 20;
		label.thickness = 1;
		label.linkOffsetY = 30;
		this.advancedTexture.addControl(label); 
		label.linkWithMesh(sphere1);

		var text1 = new BABYLON.GUI.TextBlock();
		text1.text = sphere1.name;
		text1.color = "black";
		label.addControl(text1); 

		var materialSphere1 = new BABYLON.StandardMaterial("texture1", this.scene);
		materialSphere1.diffuseColor = new BABYLON.Color3.FromHexString("#16a085");
		sphere1.material = materialSphere1
		sphere1.position.x = 0;
		this.registerAction(sphere1);
		for (var i = tags.length - 1; i >= 0; i--) {
			this.spheres.push({sphere : BABYLON.Mesh.CreateSphere(this._format.capitalize(tags[i].name), 50.0, (2 + tags[i].repRule1), this.scene), tag : tags[i]});
		}

		for (let i = 0; i <= this.spheres.length - 1; i++) {
			let sphere = this.spheres[i].sphere;
			let tag = this.spheres[i].tag;
			sphere.material = this.sphereMaterial;

			let positionX = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
			let positionY = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
			let positionZ = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));

			sphere.position.x = positionX
			sphere.position.y = positionY
			sphere.position.z = positionZ
			this.createLabel(sphere);
			this.registerAction(sphere);

			var line = new BABYLON.GUI.Line();
			line.alpha = 1;
			line.lineWidth = 0.5;
			this.advancedTexture.addControl(line); 
			line.linkWithMesh(sphere);
			line.connectedControl = label;
		}

		// GUI

		

/*
		var label = new BABYLON.GUI.Rectangle("label for " + sphere7.name);
		label.background = "black"
		label.height = "30px";
		label.alpha = 0.5;
		label.width = "100px";
		label.cornerRadius = 20;
		label.thickness = 1;
		label.linkOffsetY = 30;
		label.top = "10%";
		label.zIndex = 5;
		label.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;    
		advancedTexture.addControl(label); 

		var text1 = new BABYLON.GUI.TextBlock();
		text1.text = sphere7.name;
		text1.color = "white";
		label.addControl(text1);    

		var line = new BABYLON.GUI.Line();
		line.alpha = 0.5;
		line.lineWidth = 5;
		line.dash = [5, 10];
		advancedTexture.addControl(line); 
		line.linkWithMesh(sphere1);
		line.connectedControl = label;

		var endRound = new BABYLON.GUI.Ellipse();
		endRound.width = "10px";
		endRound.background = "black";
		endRound.height = "10px";
		endRound.color = "white";
		advancedTexture.addControl(endRound);
		endRound.linkWithMesh(sphere7);

		// Plane
		var plane = BABYLON.Mesh.CreatePlane("plane", 20);
		plane.parent = sphere4;
		plane.position.y = -10;

		// GUI
		var advancedTexture2 = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane);

		var panel2 = new BABYLON.GUI.StackPanel();  
		panel2.top = "100px";
		advancedTexture2.addControl(panel2);    

		var button1 = BABYLON.GUI.Button.CreateSimpleButton("but1", "Click Me");
		button1.width = 1;
		button1.height = "100px";
		button1.color = "white";
		button1.fontSize = 50;
		button1.background = "green";
		panel2.addControl(button1);

		var textblock = new BABYLON.GUI.TextBlock();
		textblock.height = "150px";
		textblock.fontSize = 100;
		textblock.text = "please pick an option:";
		panel2.addControl(textblock);   

		var addRadio = function(text, parent) {

			var button = new BABYLON.GUI.RadioButton();
			button.width = "40px";
			button.height = "40px";
			button.color = "white";
			button.background = "green";     

			button.onIsCheckedChangedObservable.add(function(state) {
				if (state) {
					textblock.text = "You selected " + text;
				}
			}); 

			var header = BABYLON.GUI.Control.AddHeader(button, text, "400px", { isHorizontal: true, controlFirst: true });
			header.height = "100px";
			header.children[1].fontSize = 80;
			header.children[1].onPointerDownObservable.add(function() {
				button.isChecked = !button.isChecked;
			});

			parent.addControl(header);    
		}


		addRadio("option 1", panel2);
		addRadio("option 2", panel2);
		addRadio("option 3", panel2);
		addRadio("option 4", panel2);
		addRadio("option 5", panel2);    

		this.scene.registerBeforeRender(function() {
			panel.rotation += 0.01;
		});

		/*
		// Now create a basic Babylon Scene object 
		// Change the scene background color to transparent.
		// This creates and positions a free camera
		var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), this.scene);
		// This targets the camera to scene origin
		camera.setTarget(BABYLON.Vector3.Zero());
		// This creates a light, aiming 0,1,0 - to the sky.
		var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), this.scene);

		// Dim the light a small amount
		light.intensity = .5;

		// Let's try our built-in 'sphere' shape. Params: name, subdivisions, size, scene
		var sphere = BABYLON.Mesh.CreateSphere("searchMain", 40, 2, this.scene);
		sphere.actionManager = new BABYLON.ActionManager(this.scene);
		sphere.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (function(mesh) {
			console.log("%c ActionManager: long press : " + sphere.name, 'background: green; color: white');
		}).bind(this, sphere)));

		var backgroundTexture = new BABYLON.DynamicTexture("dynamic texture", 512, this.scene, true);
		sphere.material = new BABYLON.StandardMaterial("background", this.scene);
		sphere.material.diffuseTexture = backgroundTexture;
		backgroundTexture.drawText(wordSearch.name, null, 80, "bold 70px Segoe UI", "white", "#555");
		sphere.position.y = 1;
		*/
	}

	runRender() {
		let instance = this;
		// Register a render loop to repeatedly render the scene
		this.engine.runRenderLoop(function () {
			instance.scene.render();
		});

	}		


}