import { Injectable } from '@angular/core';
import { Formatter } from '../tools/app.formatter'
import { AppSettings } from '../settings/app.settings'

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

	createLabel(mesh, position, maxGap) {

		var materialSphere1 = new BABYLON.StandardMaterial("texture1", this.scene);
		materialSphere1.diffuseColor = new BABYLON.Color3.FromHexString(AppSettings.COLORSSPHERES[maxGap - position]);
		mesh.material = materialSphere1

		var label = new BABYLON.GUI.Rectangle("label for " + mesh.name);
		label.background = "transp"
		label.height = "30px";
		label.alpha = 0.5;
		label.width = mesh.name.length >= 11 ? "200px" : "100px";
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
		//this.camera.radius = mesh.name == this.wordSearch.name ? 70 : 100; // how far from the object to follow
		this.camera.maxCameraSpeed = 10
	}

	registerAction(mesh) {
		let instance = this;
		mesh.actionManager = new BABYLON.ActionManager(this.scene);
		mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (function(mesh) {
			instance.advancedTextureGUI == undefined ? instance.createInformation(mesh) :  instance.header.text = "Informations concernant : " + mesh.name;
			instance.moveCameraToMesh(mesh)
		}).bind(this, mesh)));
	}

	createPosition() : number {
		let totalPoints = 0, maxGap = 1, nbSpheres = this.spheres.length; // The maximum between the other words, so it will be maxGap positions
		for (let i = this.spheres.length - 1; i >= 0; i--) {totalPoints += this.spheres[i].tag.repRule1} // Get total points of reputation

		let divisions = this._format.getDivisions(totalPoints, nbSpheres); // Get the divisions filled by the totalPoints
		for (let i = this.spheres.length - 1; i >= 0; i--) {
			this.spheres[i].tag.position = this._format.getReput(this.spheres[i].tag.repRule1, divisions)
		}
		for (let i = this.spheres.length - 1; i >= 0; i--) {
			if (this.spheres[i].tag.position > maxGap) {
				maxGap = this.spheres[i].tag.position 
			}
		}
		return maxGap; // Return the maxGap
	}

	getXFromPosition(pos, maxGap) : number {
		let minX = AppSettings.MINX // Avoid to collide to the center of the main sphere
		minX *= Math.floor(Math.random()*2) == 1 ? 1 : -1; // 50 chances to get Positive or negative
		let maxX = minX * maxGap;
		for (let i = 1; i <= maxGap; i++) {
			if (i == pos) { return maxX / i } 
		}
	}

	putSpheresOnScene(maxGap, label1) {
		let space = 10, sphere, tag, minX, maxX, line;
		for (let i = 0; i <= this.spheres.length-1; i++) {
			tag = this.spheres[i].tag;
			sphere = this.spheres[i].sphere;
			sphere.material = this.sphereMaterial;
			minX = this.getXFromPosition(tag.position, maxGap)
			minX *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			space *= Math.floor(Math.random()*2) == 1 ? 1 : -1;
			maxX = minX + space

			sphere.position.x = this._format.randomIntFromInterval(-minX,minX)
			sphere.position.y = this._format.randomIntFromInterval(-minX,minX)
			sphere.position.z = this._format.randomIntFromInterval(-minX,minX)

			this.createLabel(sphere, tag.position, maxGap);
			this.registerAction(sphere);

			line = new BABYLON.GUI.Line();
			line.alpha = 1;
			line.color = "#1678c2";
			line.lineWidth = 0.5;
			this.advancedTexture.addControl(line); 
			line.linkWithMesh(sphere);
			line.connectedControl = label1;
		}
	}


	createScene(wordSearch, tags){
		this.wordSearch = wordSearch;
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color4(0,0,0,0.0000000000000001); 
		this.camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, 1.0, 110, BABYLON.Vector3.Zero(),this.scene);
		this.camera.attachControl(this.canvas, true);
		this.scene.collisionsEnabled = false;
		this.camera.checkCollisions = false;
		var hemi = new BABYLON.HemisphericLight("toto");
		var sphereMaterial = new BABYLON.StandardMaterial();
		this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");

		var sphere1 = BABYLON.Mesh.CreateSphere(wordSearch.name, 50.0, 15, this.scene);
		var label1 = new BABYLON.GUI.Rectangle("label for " + sphere1.name);

		this.createMainMesh(sphere1, label1);

		for (var i = tags.length - 1; i >= 0; i--) {
			this.spheres.push({sphere : BABYLON.Mesh.CreateSphere(this._format.capitalize(tags[i].name), 50.0, (2 + tags[i].repRule1), this.scene), tag : tags[i]});
		}
		
		let maxGap = this.createPosition();
		this.putSpheresOnScene(maxGap, label1);


		/*let positionX = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
		let positionY = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
		let positionZ = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
		*/
	}

	createMainMesh(sphere, label) {
		label.background = "#1B1C1D"
		label.height = "30px";
		label.alpha = 1;
		label.width = "100px";
		label.cornerRadius = 20;
		label.thickness = 1;
		label.linkOffsetY = 30;
		this.advancedTexture.addControl(label); 
		label.linkWithMesh(sphere);

		var text1 = new BABYLON.GUI.TextBlock();
		text1.text = sphere.name;
		text1.color = "white";
		label.addControl(text1); 

		var materialSphere1 = new BABYLON.StandardMaterial("texture1", this.scene);
		materialSphere1.diffuseColor = new BABYLON.Color3.FromHexString("#16a085");
		sphere.material = materialSphere1
		sphere.position.x = 0;
		sphere.position.y = 20;
		this.registerAction(sphere);
	}

	runRender() {
		let instance = this;
		// Register a render loop to repeatedly render the scene
		this.engine.runRenderLoop(function () {
			instance.scene.render();
		});

	}		


}