import { Component, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';

import { Entry } from '../model/entry'
import { UserService } from '../model/user-service';
import { HistorySearchService } from '../model/history-search';

declare var $:any; // This is necessary if you want to use jQuery in the app

@Component({
	selector: 'app-insertion',
	templateUrl: './app.insertion.html',
	styleUrls: ['./app.insertion.css'],
})

export class AppInsertion implements OnInit {
	public newModule = false;
	public loading = false;
	public nameTaken = false;
	public nameTakenModule = false;

	public nameChosen = false;
	public nameChosenModule = false;

	public loadingAddModule = false;
	public newModuleObj : any= {id: "", name:"", goals: ""}
	public errorAddModule = false;
	public errorTextAddModule = "";
	public msgIdModuleTaken = "Ce N° est disponible"

	public msgNameTaken = "Ce nom est disponible";
	public styleModuleNew = AppSettings.WHITEMOREDARK;
	public styleModuleNewCol = AppSettings.BLACK;
	public styleModuleEx = AppSettings.GREY;
	public styleModuleExCol = AppSettings.WHITE;
	public data = {};
	public types = [];
	public modules : Array<any> = [];
	public valuesModules : Array<any> = []
	public contexts = [];
	public word : string = '';
	public newModules : string = '';
	public source : string = ""; // Separate with the comma
	public definition : string = ""; 
	public meaning : string = "";

	public items = [];

	constructor(private _httpService : HttpAPIService, private _alert: AlertsService, private _userservice : UserService, private _historysearch : HistorySearchService) {
		_userservice.getCurrentUser()
		console.log(_historysearch.getLastSearches())
	}

	addModule() {
		if (this.newModuleObj.id == "" || this.newModuleObj.name == "" || this.newModuleObj.goals == "" ) {
			this.errorAddModule = true;
			this.errorTextAddModule = "Veuillez compléter tous les champs requis : N° du module, Nom du module et Objectifs du module"
		} else {
			if (this.nameTakenModule) {
				this.errorAddModule = true;
				this.errorTextAddModule = "Veuillez choisir un autre n° pour l'identifiant du module, car ce dernier a déjà été utilisé !"
				return
			}
			this.errorAddModule = false;
			this.loadingAddModule = true;
			this._httpService.postEntryJSON(this.newModuleObj, AppSettings.API_MODULES, this.newModuleObj.id, this._userservice.currentUser.secretKey)
				.subscribe(
					data => {
						console.log(data);
						this.loadingAddModule = false;
						var element: any = {}
						element.selected = true;
						element.text = this.newModuleObj.id;
						element.name = this.newModuleObj.id + " - " + this.newModuleObj.name
						element.value = this.newModuleObj.id;
						this.valuesModules.push(element)
						this.switchModule(false, 'A')
						$('.ui.dropdown.multiple').dropdown({values : this.valuesModules})
						this.newModuleObj = {id: "", name:"", goals: ""}
						this._alert.create('success', 'Le module a été inséré avec succès, il se trouve désormais avec les existants !');}
				)
		}
	}

	isUnique(idChoice, idSelectTagHtml, property) {
		let instance = this;
		let word = (idChoice == 0 ? instance.word : instance.newModuleObj.id)
		let apiObservatory = (idChoice == 0 ? AppSettings.API_WORDS : AppSettings.API_MODULES)
		if (word != "") {
			$(idSelectTagHtml).removeClass('info');
			$(idSelectTagHtml).addClass('circle');
			$(idSelectTagHtml).addClass('notched');
			$(idSelectTagHtml).addClass('loading');
			if (idChoice == 0) {instance.nameChosen = true} else {instance.nameChosenModule = true}
			this._httpService.getEntryJSON(apiObservatory)
			.subscribe(
				function(response) {
					let obj = response.dictionary.entries;
					let data
					let count = 0;
					let props = Object.keys(obj)
					
					let i = 0
					while(i <= props.length - 1 && count < 1) {
						data = JSON.parse(obj[props[i]].value);
						count = count + (word.toLowerCase() == data[property].toLowerCase() ? 1 : 0);
						i++
					}

					setTimeout(function(){
						$(idSelectTagHtml).removeClass('circle');
						$(idSelectTagHtml).removeClass('notched');
						$(idSelectTagHtml).removeClass('loading');
						$(idSelectTagHtml).addClass('info');
					}, 200);
					if (idChoice == 0) {
						instance.nameTaken = count >= 1
						instance.msgNameTaken = instance.nameTaken ? "Ce nom existe déjà !":  "Ce nom est disponible";
					} else {
						instance.nameTakenModule = count >= 1
						instance.msgIdModuleTaken = instance.nameTakenModule ? "Ce n° a déjà été choisi !":  "Ce n° est disponible";
					}
				}
			)
		} else {
			if (idChoice == 0) {instance.nameChosen = false} else {instance.nameChosenModule = false}
		}
	}


	ngAfterViewInit(){
		$('.ui.dropdown').dropdown();
		$('.ui.dropdown.multiple').dropdown({allowAdditions: true,});
		this.isUnique(0, '#wordInfo', 'name');
	}

	getModulesValues() {
		this.valuesModules.splice(0, this.valuesModules.length)
		this.valuesModules.push(...this.modules)
		for (var index = 0; index < this.valuesModules.length; index++) {
			var element = this.valuesModules[index];
			element.selected = false;
			element.text = element.id;
			element.name = element.id + " - " + element.name
			element.value = element.id;
		}
		$('.ui.dropdown.multiple').dropdown({values : this.valuesModules})
	}

	getData(observatory, table : Array<any>) {
		let instance = this;
		this._httpService.getEntryJSON(observatory)
		.subscribe(
			function(response) { // The communication with the API has matched
				console.log(response); // Transform js object into json
				let obj = response.dictionary.entries;
				for (let prop in obj){ table.push(table == instance.modules ? JSON.parse(obj[prop].value) : obj[prop]);}
				if (table == instance.modules) {
					instance.getModulesValues()
					
				}
			},
		)
	}

	ngOnInit() {
		let instance = this;
		instance.types.splice(0,instance.types.length);
		instance.contexts.splice(0,instance.contexts.length);
		instance.modules.splice(0,instance.contexts.length);
		this.getData(AppSettings.API_TYPES, instance.types); // Get the data of types
		this.getData(AppSettings.API_CONTEXT, instance.contexts); // Get the data of contexts
		this.getData(AppSettings.API_MODULES, instance.modules); // Get the data of contexts
	}

	validated() { // Function who validates if everything is ok before the insert
		return this.word != "" && this.source != "" && this.meaning != ""; // Value required to insert
	}

	reinit() {
		this.word = "";
		this.source = ""; // Separate with the comma
		this.definition = ""; 
		this.meaning = "";
		this.newModules = "";
		this.ngOnInit();
	}

	saveInsertion() {
		console.log(this.items)
		if (this.validated()) {
			let tags = "";
			for (var index = 0; index < this.items.length; index++) {
				var element = this.items[index];
				tags = tags + element.display + (index == this.items.length -1 ? "": ", ")
			}
			
			let instance = this;
			this.loading = true;
			
			let modules = this.newModules.split(',');
			let modulesNotNew = $('.ui.dropdown.multiple').dropdown('get value');

			
			let dataInfo = {
				name : this.word,
				type: $('#select-types').text() == "Aucun" ? "" :  $('#select-types').text(), 
				source : this.source, 
				modules : modulesNotNew, 
				definition: this.definition, 
				meaning : this.meaning, 
				context :  $('#select-context').text() == "Aucun" ? "" : $('#select-context').text(), 
				commentary : "", 
				review : "",
				keywords : tags
			};
			instance._httpService.postEntryJSON(dataInfo, AppSettings.API_WORDS, dataInfo.name, instance._userservice.currentUser.secretKey)
			.subscribe(
				function(response) { // The communication with the API has matched
					console.log(response)
					instance._httpService.postEntryMetadata(AppSettings.API_METASEARCHCLICK, 0, response, instance._userservice.currentUser.secretKey) // Put searchClick to 0
					.subscribe(
						function(resp) {
							instance.loading = false;
							instance._alert.create('success', AppSettings.MSGSUCCESS)
							data => instance.data = data
							instance.reinit();
						}	
					)
				},
				// The communication with the API has not matched
				function(error) {instance.loading = false; instance._alert.create('error', AppSettings.MSGERROR); },
			);
		} else {
			 this._alert.create('warning', AppSettings.MSGINCOMPLETED);
		}
	}

	switchModule(val, choice) {
		this.newModule = val;
		this.styleModuleNew = (choice == 'A' ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleNewCol = (choice == 'A' ? AppSettings.BLACK : AppSettings.WHITE);
		this.styleModuleEx = (choice == 'B' ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleExCol = (choice == 'B' ? AppSettings.BLACK : AppSettings.WHITE);
	}
}