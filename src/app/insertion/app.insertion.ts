import { Component, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';

import { Entry } from '../model/entry'
import { EntryCowaboo } from '../model/entrycowaboo'
import { UserService } from '../model/user-service';
import { Formatter } from '../tools/app.formatter';
import { HistorySearchService } from '../model/history-search';

declare var $:any; // This is necessary if you want to use jQuery in the app

@Component({
	selector: 'app-insertion',
	templateUrl: './app.insertion.html',
	styleUrls: ['./app.insertion.css'],
})

export class AppInsertion implements OnInit{

	public loading : boolean = false


	public newModule = false;
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

	constructor(private _httpService : HttpAPIService, private _format : Formatter, private _alert: AlertsService, private _userservice : UserService, private _historysearch : HistorySearchService) {}

	ngOnInit() {
		this._format.deleteAllModals()
		this._userservice.getCurrentUser()
		console.log(this._historysearch.getLastSearches())
		let instance = this;
		instance.types.splice(0,instance.types.length);
		instance.contexts.splice(0,instance.contexts.length);
		instance.modules.splice(0,instance.contexts.length);
		this.getData(AppSettings.API_TYPES, instance.types); // Get the data of types
		this.getData(AppSettings.API_CONTEXT, instance.contexts); // Get the data of contexts
		this.getData(AppSettings.API_MODULES, instance.modules); // Get the data of contexts
	}

	ngAfterViewInit(){
		$('.ui.dropdown').dropdown();
		$('.ui.dropdown.multiple').dropdown({allowAdditions: true,});
		this.isUnique(0, '#wordInfo', 'name');
	}

	isModuleValid() {
		return (this.newModuleObj.id != "" && this.newModuleObj.name != "" && this.newModuleObj.goals != "")
	}
	
	afterModuleInserted(data) {
		console.log(data);
		this.loadingAddModule = false;
		let element: any = {}
		element.selected = true;
		element.text = this.newModuleObj.id;
		element.name = this.newModuleObj.id + " - " + this.newModuleObj.name
		element.value = this.newModuleObj.id;
		this.valuesModules.push(element)
		this.switchExistsOrAddModule(false, 'A')
		$('.ui.dropdown.multiple').dropdown({values : this.valuesModules})

		this.newModuleObj = {id: "", name:"", goals: ""}
		this._alert.create('success', AppSettings.MSG_MODULE_INSERT_SUCCESS);
	}

	addModule() {
		this.errorAddModule = (!this.isModuleValid() || this.nameTakenModule)
		if (this.errorAddModule) { // Module invalid
			this.errorTextAddModule = this.nameTakenModule ? AppSettings.MSG_ERROR_NO_MODULE_TAKEN : AppSettings.MSG_ERROR_INFO_MODULE_EMPTY
		} else {
			this.loadingAddModule = true;
			
			this._httpService.postEntryJSON(this.newModuleObj, AppSettings.API_MODULES, this.newModuleObj.id, this._userservice.currentUser.secretKey)
				.subscribe(
					data => {
						this.afterModuleInserted(data)
					},
					error => {
						this._alert.create('error', AppSettings.MSG_MODULE_INSERT_ERROR);
					}
					
				)
		}
	}

	addRemoveClass(el, classesRemove, classesAdd) {
		$(el).removeClass(classesRemove).addClass(classesAdd);
	}

	isUnique(idChoice, idSelectTagHtml, property) {
		let instance = this;
		let test = idChoice == 0
		let word = (test ? instance.word : instance.newModuleObj.id)
		let apiObservatory = (test ? AppSettings.API_WORDS : AppSettings.API_MODULES)
		if (word != "") {
			instance.addRemoveClass(idSelectTagHtml, 'info', 'circle notched loading')
			test ? instance.nameChosen = test : instance.nameChosenModule = !test
			instance._httpService.getEntryJSON(apiObservatory)
			.subscribe(
				function(response) {
					let obj = response.dictionary.entries, data, props = Object.keys(obj), count = 0, i = 0
					while(i <= props.length - 1 && count < 1) {
						data = JSON.parse(obj[props[i]].value);
						count = count + (word.toLowerCase() == data[property].toLowerCase() ? 1 : 0);
						i++
					}
					setTimeout(function(){
						instance.addRemoveClass(idSelectTagHtml, 'circle notched loading', 'info')
					}, 200);
					
					test ? (instance.nameTaken = count >= 1) :  (instance.nameTakenModule = count >= 1)
					test ? (instance.msgNameTaken = instance.nameTaken ? "Ce nom existe déjà !":  "Ce nom est disponible") : (instance.msgIdModuleTaken = instance.nameTakenModule ? "Ce n° a déjà été choisi !":  "Ce n° est disponible")
				}
			)
		} else {
			test ? instance.nameChosen = !test : instance.nameChosenModule = test
		}
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
		let instance = this
		let isModules = table == instance.modules
		this._httpService.getEntryJSON(observatory).subscribe(
			response => {
				let obj = response.dictionary.entries;
				for (let prop in obj){ table.push(isModules ? JSON.parse(obj[prop].value) : obj[prop]);}
				if (isModules) {instance.getModulesValues()}
			},
			error => { console.log(error) }
		)
	}

	validated() { // Function who validates if everything is ok before the insert
		return this.word != "" && this.source != "" && this.meaning != ""; // Value required to insert
	}

	reinit() {
		this.word = ""; this.source = ""; this.definition = ""; this.meaning = ""; this.newModules = "";
		this.items.splice(0, this.items.length)
		this.ngOnInit();
	}

	saveInsertion() {
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
			let type = $('#select-types').text() == "Aucun" ? "" :  $('#select-types').text()
			let context = $('#select-context').text() == "Aucun" ? "" : $('#select-context').text()
			
			let dataInfo = new EntryCowaboo(this.word, type, this.source, modulesNotNew, this.definition, this.meaning, context, "", tags, "", this._format.getTodayTimestamp(), [], [], false, "")
			
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

	switchExistsOrAddModule(val, choice) {
		let choiceA = choice == 'A'
		let choiceB = choice == 'B'
		this.newModule = val;
		this.styleModuleNew = (choiceA ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleNewCol = (choiceA ? AppSettings.BLACK : AppSettings.WHITE);
		this.styleModuleEx = (choiceB ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleExCol = (choiceB ? AppSettings.BLACK : AppSettings.WHITE);
	}
}