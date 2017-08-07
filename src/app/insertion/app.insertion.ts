import { Component, AfterViewInit } from '@angular/core';
import { HttpAPIService } from '../api/app.http-service';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';
import { AppSettings } from '../settings/app.settings';
import { UserService } from '../model/user-service';
import { OnInit } from '@angular/core';

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
	public nameChosen = false;
	public msgNameTaken = "Ce nom est disponible";
	public styleModuleNew = AppSettings.WHITEMOREDARK;
	public styleModuleNewCol = AppSettings.BLACK;
	public styleModuleEx = AppSettings.GREY;
	public styleModuleExCol = AppSettings.WHITE;
	public data = {};
	public types = [];
	public modules = [];
	public contexts = [];
	public word : string = '';
	public newModules : string = '';
	public source : string = ""; // Separate with the comma
	public definition : string = ""; 
	public explications : string = "";
	public items = ['Angular' ,'React'];

	constructor(private _httpService : HttpAPIService, private _alert: AlertsService, private _userservice : UserService) {
		console.log(_userservice.getCurrentUser())
	}

	isUnique() {
		let instance = this;
		if (instance.word != "") {
			$('#wordInfo').removeClass('info');
			$('#wordInfo').addClass('circle');
			$('#wordInfo').addClass('notched');
			$('#wordInfo').addClass('loading');
			instance.nameChosen = true;
			this._httpService.getEntryJSON(AppSettings.API_WORDS)
			.subscribe(
				function(response) {
					let obj = response.dictionary.entries;
					let data
					let count = 0;
					for (let prop in obj){
						data = JSON.parse(obj[prop].value);
						count += instance.word.toLowerCase() == data.name.toLowerCase() ? 1 : 0;
					}
					setTimeout(function(){
						$('#wordInfo').removeClass('circle');
						$('#wordInfo').removeClass('notched');
						$('#wordInfo').removeClass('loading');
						$('#wordInfo').addClass('info');
					}, 200);
					instance.nameTaken = count >= 1
					instance.msgNameTaken = instance.nameTaken ? "Ce nom existe déjà !":  "Ce nom est disponible";
				}
			)
		} else {
			instance.nameChosen = false;
		}
	}


	ngAfterViewInit(){
		$('.ui.dropdown').dropdown();
		$('#multi-select-modules').dropdown({
			allowAdditions: true,
			filterRemoteData: true
		});
		this.isUnique();
	}

	getData(observatory, table) {
		this._httpService.getEntryJSON(observatory)
		.subscribe(
			function(response) { // The communication with the API has matched
				console.log(response); // Transform js object into json
				console.log(response.dictionary.entries);
				let obj = response.dictionary.entries;
				for (let prop in obj){ table.push(obj[prop])}
			},
		)
	}

	ngOnInit() {
		let instance = this;
		instance.types.splice(0,instance.types.length);
		instance.contexts.splice(0,instance.contexts.length);

		this.getData(AppSettings.API_TYPES, instance.types); // Get the data of types
		this.getData(AppSettings.API_CONTEXT, instance.contexts); // Get the data of contexts
		this.getData(AppSettings.API_MODULES, instance.modules); // Get the data of contexts
	}

	validated() { // Function who validates if everything is ok before the insert
		return this.word != "";
	}

	insertNewData() {
		let instance = this;
		if (this.newModule) {
			let modules = instance.newModules.split(',');
			this._httpService.postEntryJSON(modules, AppSettings.API_MODULES, instance.newModules)
			.subscribe()
		}
	}

	reinit() {
		this.word = "";
		this.source = ""; // Separate with the comma
		this.definition = ""; 
		this.explications = "";
		this.newModules = "";
		this.ngOnInit();
	}

	saveInsertion() {
		if (this.validated()) {
			this.loading = true;
			let instance = this;
			let modules = this.newModules.split(',');
			let modulesNotNew = "";
			if(this.newModule) {
				//this.insertNewData();
				modulesNotNew = this.newModules;
			} else {
				if ($('#multi-select-modules').children('a.ui.label.transition.visible').text() != "") {
					let listModules = $('#multi-select-modules').children('a.ui.label.transition.visible').text();
					listModules = listModules.split('[');
					listModules = listModules[1].split(']');
					listModules = listModules[0].split('"');
					for (let i = 0; i <= listModules.length - 1; i++) {
						modulesNotNew += listModules[i];
					}
				} else {
					modulesNotNew = "";
				}
			}
			
			let dataInfo = {name : this.word, type: $('#select-types').text() == "Aucun" ? "" :  $('#select-types').text(), source : this.source, modules : modulesNotNew, definition: this.definition, explications : this.explications, context :  $('#select-context').text() == "Aucun" ? "" : $('#select-context').text(), commentary : "", review : ""};
			instance._httpService.postEntryJSON(dataInfo, AppSettings.API_WORDS, dataInfo.name)
			.subscribe(
				function(response) { // The communication with the API has matched
					instance._httpService.postEntryMetadata(AppSettings.API_METASEARCHCLICK, 0, response) // Put searchClick to 0
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