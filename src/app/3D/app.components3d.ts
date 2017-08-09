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
	private wordSel
	private sphereMaterial
	private spheres = []
	private advancedTexture = { addControl: function (label) { } , getMeshByName: function(string) {}, _rootContainer : {children: []}}

	private camera
	private advancedTextureGUI
	private panel3
	private header
	private info

	constructor(private _format: Formatter) { }

	startEngine(nameElement) {
		this.canvas = document.getElementById(nameElement);
		this.engine = new BABYLON.Engine(this.canvas, true);
	}

	createLabel(mesh, position, maxGap) {

		var materialSphere1 = new BABYLON.StandardMaterial("texture1", this.scene);
		materialSphere1.diffuseColor = new BABYLON.Color3.FromHexString(AppSettings.COLORSSPHERES[maxGap - position]);
		mesh.material = materialSphere1

		var label = new BABYLON.GUI.Rectangle("label" + mesh.name);
		label.background = "transp"
		label.height = "30px";
		label.alpha = 0.5;
		label.width = mesh.name.length >= 11 ? "200px" : "100px";
		label.cornerRadius = 20;
		label.thickness = 1;
		label.linkOffsetY = 30;
		this.advancedTexture.addControl(label);
		label.linkWithMesh(mesh);

		var text1 = new BABYLON.GUI.TextBlock('text' + mesh.name);
		text1.text = mesh.name;
		text1.color = "black";
		label.addControl(text1);
	}

	createInformation(mesh, tag) {
		// Another GUI on the right

		this.header = null
		this.info = null
		delete (this.header);
		delete (this.info);
		delete (this.advancedTextureGUI);
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
		this.info.text = "Type : " + this.wordSearch.type + "\n" + "Explications : " + "\n" + (tag == null) ? this.wordSearch.explications : tag.meaning;
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

	}


	moveCamera(mesh) {
		let instance = this;
		var startPos = this.camera.target.z;
		var startRadius = this.camera.radius;
		var translate = new BABYLON.Animation("camTranslate", "target.z", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var radius = new BABYLON.Animation("camAlpha", "radius", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

		var keys = [{ frame: 0, value: startPos }, { frame: 30, value: mesh }];
		var keys2 = [{ frame: 0, value: startRadius }, { frame: 30, value: 70 }];
		translate.setKeys(keys);
		radius.setKeys(keys2);
		this.camera.animations.push(translate);
		this.camera.animations.push(radius);
		this.scene.beginAnimation(this.camera, 0, 30, false, 1, function () {});
	}

	getLabelByName(mesh, type) {
		let labels = this.advancedTexture._rootContainer.children
		var pos = -1
		for (var i = 0; i < labels.length; i++) {
			var element = labels[i];
			if (labels[i].name == type +mesh.name) {
				pos = i;
			} else {
				labels[i].alpha = 0.5
			}
		}
		return pos;
	}

	moveCameraToMesh(mesh) {
		/*this.camera.lockedTarget = mesh;*/


		this.camera.setTarget(mesh);
		this.moveCamera(mesh)
		this.camera.maxCameraSpeed = 10
		var pos = this.getLabelByName(mesh, 'label')
		var label = this.advancedTexture._rootContainer.children[pos]
		label.alpha = 1
		/*var label = this.advancedTexture.getMeshByName("label" + mesh.name)
		console.log(label)*/
	}

	registerAction(mesh, tag) {
		let instance = this;
		mesh.actionManager = new BABYLON.ActionManager(this.scene);
		mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (function (mesh) {

			/*instance.advancedTextureGUI == undefined ? instance.createInformation(mesh, tag) :  instance.header.text = "Informations concernant : " + mesh.name;
			instance.info.text = tag == null ? instance.wordSearch.explications : tag.meaning*/
			instance.moveCameraToMesh(mesh)
			console.log(tag);
			if (tag == null) {
				instance.wordSel.name = instance.wordSearch.name
				instance.wordSel.explications = instance.wordSearch.explications;
				instance.wordSel.source = instance.wordSearch.source;
				instance.wordSel.totalReput = 0;
				return
			}
			instance.wordSel.name = mesh.name
			instance.wordSel.explications = tag.meaning;
			instance.wordSel.source = tag.source;
			instance.wordSel.totalReput = tag.totalReput;

		}).bind(this, mesh)));
	}

	createPosition(): number {
		let totalPoints = 0, maxGap = 1, nbSpheres = this.spheres.length; // The maximum between the other words, so it will be maxGap positions
		for (let i = this.spheres.length - 1; i >= 0; i--) { totalPoints += this.spheres[i].tag.totalReput } // Get total points of reputation

		let divisions = this._format.getDivisions(totalPoints, nbSpheres); // Get the divisions filled by the totalPoints
		for (let i = this.spheres.length - 1; i >= 0; i--) {
			this.spheres[i].tag.position = this._format.getReput(this.spheres[i].tag.totalReput, divisions)
		}
		for (let i = this.spheres.length - 1; i >= 0; i--) {
			if (this.spheres[i].tag.position > maxGap) {
				maxGap = this.spheres[i].tag.position
			}
		}
		return maxGap; // Return the maxGap
	}

	getXFromPosition(pos, maxGap): number {
		let minX = AppSettings.MINX // Avoid to collide to the center of the main sphere
		minX *= Math.floor(Math.random() * 2) == 1 ? 1 : -1; // 50 chances to get Positive or negative
		let maxX = minX * maxGap;
		for (let i = 1; i <= maxGap; i++) {
			if (i == pos) { return maxX / i }
		}
	}

	putSpheresOnScene(maxGap, label1) {
		let space = 10, sphere, tag, minX, maxX, line;
		for (let i = 0; i <= this.spheres.length - 1; i++) {
			tag = this.spheres[i].tag;
			sphere = this.spheres[i].sphere;
			sphere.material = this.sphereMaterial;
			minX = this.getXFromPosition(tag.position, maxGap)
			minX *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
			space *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
			maxX = minX + space

			sphere.position.x = this._format.randomIntFromInterval(-minX, minX)
			sphere.position.y = this._format.randomIntFromInterval(-minX, minX)
			sphere.position.z = this._format.randomIntFromInterval(-minX, minX)

			this.createLabel(sphere, tag.position, maxGap);
			this.registerAction(sphere, tag);

			line = new BABYLON.GUI.Line('line' + tag.name);
			line.alpha = 1;
			line.color = "#1678c2";
			line.lineWidth = 0.5;
			this.advancedTexture.addControl(line);
			line.linkWithMesh(sphere);
			line.connectedControl = label1;
		}
	}


	createScene(wordSearch, tags, wordSel) {
		this.wordSearch = wordSearch;
		this.wordSel = wordSel;
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0.0000000000000001);
		this.camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, 1.0, 110, BABYLON.Vector3.Zero(), this.scene);
		//this.camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, -8, -80), this.scene);
		this.camera.attachControl(this.canvas, true);
		this.scene.collisionsEnabled = false;
		this.camera.checkCollisions = false;
		var hemi = new BABYLON.HemisphericLight("toto");
		var sphereMaterial = new BABYLON.StandardMaterial();
		this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");

		var sphere1 = BABYLON.Mesh.CreateSphere(wordSearch.name, 50.0, 15, this.scene);
		var label1 = new BABYLON.GUI.Rectangle("label" + sphere1.name);

		this.createMainMesh(sphere1, label1);

		for (var i = tags.length - 1; i >= 0; i--) {
			this.spheres.push({ sphere: BABYLON.Mesh.CreateSphere(this._format.capitalize(tags[i].name), 50.0, (2 + tags[i].repRule1), this.scene), tag: tags[i] });
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
		sphere.position.y = 15;
		this.registerAction(sphere, null);
	}

	runRender() {
		let instance = this;
		// Register a render loop to repeatedly render the scene
		this.engine.runRenderLoop(function () {
			instance.scene.render();
		});

	}


}