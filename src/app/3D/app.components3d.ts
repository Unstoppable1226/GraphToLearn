import { Injectable } from '@angular/core';
import { Formatter } from '../tools/app.formatter'
import { AppSettings } from '../settings/app.settings'

import { Entry } from '../model/entry'

declare var BABYLON: any;
declare var $: any;
declare var Button: any;

@Injectable()
export class Manager3D {
	private canvas
	private engine
	private scene
	private wordSearch : Entry
	private wordSel : Entry
	private sphereMaterial
	private spheres = []
	private advancedTexture : any
	private lines = []

	private camera
	private advancedTextureGUI
	private panel3
	private header
	private info

	constructor(private _format: Formatter) { }

	startEngine(nameElement) {
		this.canvas = document.getElementById(nameElement);
		this.engine = new BABYLON.Engine(this.canvas, false);
		
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
		this.lines.push(label)
	}

	moveCamera(mesh) {
		let instance = this;
		var startPos = this.camera.target.z;
		var startRadius = this.camera.radius;
		var translate = new BABYLON.Animation("camTranslate", "target.z", 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		var radius = new BABYLON.Animation("camAlpha", "radius", 10, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

		var keys = [{ frame: 0, value: startPos }, { frame: 10, value: mesh }];
		var keys2 = [{ frame: 0, value: startRadius }, { frame: 10, value: 80 }];
		translate.setKeys(keys);
		radius.setKeys(keys2);
		this.camera.animations.push(translate);
		this.camera.animations.push(radius);
		this.scene.beginAnimation(this.camera, 0, 10, false, 1, function () {});
	}

	getLabelByName(mesh, type) {
		let labels = this.advancedTexture._rootContainer.children
		var pos = -1
		for (var i = 0; i < labels.length; i++) {
			var element = labels[i]
			if (labels[i].name == type + mesh.name) {
				pos = i
			} else {
				labels[i].alpha = 0.5
			}
		}
		return pos;
	}

	moveCameraToMesh(mesh) {
		/*this.camera.lockedTarget = mesh;*/
		this.camera.setTarget(mesh)
		this.camera.maxCameraSpeed = 20
		this.moveCamera(mesh)
		var pos = this.getLabelByName(mesh, 'label')
		var label = this.advancedTexture._rootContainer.children[pos]
		label.alpha = 1
		/*var label = this.advancedTexture.getMeshByName("label" + mesh.name)
		console.log(label)*/
	}

	updateInfos(mesh, data) {
		console.log(data)
		this.wordSel.name = mesh.name
		this.wordSel.type = data.type
		this.wordSel.context = data.context
		this.wordSel.meaning = data.meaning;
		this.wordSel.source = data.source;
		this.wordSel.totalReput = data.totalReput;
		this.wordSel.definition = data.definition;
		this.wordSel.modules = data.modules
		this.wordSel.searchClick = data.searchClick
		this.wordSel.like = data.like
		this.wordSel.dislike = data.dislike
		this.wordSel.canLike = data.canLike
		this.wordSel.canDislike = data.canDislike
		this.wordSel.likes = data.likes
		this.wordSel.dislikes = data.dislikes
		this.wordSel.keywords = data.keywords
		this.wordSel.author = data.author
		this.wordSel.lastUpdatedNbDays = data.lastUpdatedNbDays;
		this.wordSel.timestampCreation = data.timestampCreation;
		this.wordSel.modulesReputation = data.modulesReputation;
		this.wordSel.updates = data.updates;
		this.wordSel.comments = data.comments;
		this.wordSel.lastUpdated = data.lastUpdated;
		this.wordSel.lastUpdatedAuthor = data.lastUpdatedAuthor;
	}

	registerAction(mesh, tag) {
		let instance = this;
		mesh.actionManager = new BABYLON.ActionManager(this.scene);
		mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, (function (mesh) {
			instance.moveCameraToMesh(mesh)
			if (tag == null) {
				this.updateInfos(mesh, instance.wordSearch)
				return
			}
			this.updateInfos(mesh, tag)
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
			if (tag.position == undefined) {
				tag.position = 1
			}
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
			this.lines.push(line)
		}
	}

	createScene(wordSearch, tags, wordSel, modules) {
		this.wordSearch = wordSearch;
		this.wordSel = wordSel;
		this.scene = new BABYLON.Scene(this.engine);
		this.scene.clearColor = new BABYLON.Color4(0, 0, 0, 0.0000000000000001);
		this.camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, 1.0, 125, BABYLON.Vector3.Zero(), this.scene);
		this.camera.attachControl(this.canvas, true);
		this.scene.collisionsEnabled = false;
		this.camera.checkCollisions = false;
		this.advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("ui1");
		
		var light0 = new BABYLON.HemisphericLight("Hemi0", new BABYLON.Vector3(0, 1, 0), this.scene);
		light0.diffuse = new BABYLON.Color3(1, 1, 1);
		light0.specular = new BABYLON.Color3(1, 1, 1);

		var sphereMaterial = new BABYLON.StandardMaterial();
		
		let i = 0;
		var sphere1 = BABYLON.Mesh.CreateSphere(wordSearch.name, 50.0, 15, this.scene);
		var label1 = new BABYLON.GUI.Rectangle("label" + sphere1.name);
		this.lines.push(label1)
		for (let props in modules) {
			var element = modules[props];
			var sphere = BABYLON.Mesh.CreateSphere(element.id, 80.0, 25 , this.scene);
			var label = new BABYLON.GUI.Rectangle("label" + sphere.name);
			this.lines.push(label);
			this.createMainMesh(sphere, label, (-50 * Object.keys(modules).length + (i * 100)), 50, AppSettings.COL_MODULE);
			var line = new BABYLON.GUI.Line('line' + element.name);
			
			line.alpha = 1;
			line.color = "black";
			line.lineWidth = 1.5;
			this.advancedTexture.addControl(line);
			line.linkWithMesh(sphere);
			line.connectedControl = label1;
			this.lines.push(line)
			i++;
		}
		

		this.createMainMesh(sphere1, label1, 0, 15, AppSettings.COL_SEARCH_TERM);

		
		for (var cpt = tags.length - 1; cpt >= 0; cpt--) {
			this.spheres.push(
				{ 
					sphere: BABYLON.Mesh.CreateSphere(this._format.capitalize(tags[cpt].name), 50.0, (2 + tags[cpt].repRule1), this.scene), 
					tag: tags[cpt] 
				}
			);
		}

		let maxGap = this.createPosition();
		this.putSpheresOnScene(maxGap, label1);


		/*let positionX = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
		let positionY = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
		let positionZ = (Math.floor((Math.random() * (tag.repRule1 * this._format.randomIntFromInterval(-100,100)) + (this._format.randomIntFromInterval(-1,1) * (i*2))) * (this._format.randomIntFromInterval(-1,1) * tag.repRule1)));
		*/
	}

	createMainMesh(sphere, label, posX, posY, color) {
		label.background = "#1B1C1D"
		label.height = "30px";
		label.alpha = 1;
		label.width = sphere.name.length >= 30 ? "400px" : sphere.name.length >= 20 ? "300px" : sphere.name.length >= 11 ? "200px" : "100px";
		label.cornerRadius = 20;
		label.thickness = 1;
		label.linkOffsetY = 30;
		this.advancedTexture.addControl(label);
		label.linkWithMesh(sphere);

		var text1 = new BABYLON.GUI.TextBlock();
		text1.text = sphere.name;
		text1.color = "white";
		label.addControl(text1);

		this.lines.push(label)
		var materialSphere1 = new BABYLON.StandardMaterial("texture1", this.scene);
		materialSphere1.diffuseColor = new BABYLON.Color3.FromHexString(color);
		sphere.material = materialSphere1
		sphere.position.x = posX;
		sphere.position.y = posY;
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