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
	public nameChosen = false;
	public msgNameTaken = "Ce nom est disponible";
	public styleModuleNew = AppSettings.WHITEMOREDARK;
	public styleModuleNewCol = AppSettings.BLACK;
	public styleModuleEx = AppSettings.GREY;
	public styleModuleExCol = AppSettings.WHITE;
	public data = {};
	public types = [];
	public modules : Array<any> = [];
	public contexts = [];
	public word : string = '';
	public newModules : string = '';
	public source : string = ""; // Separate with the comma
	public definition : string = ""; 
	public meaning : string = "";



	public items = ['Angular' ,'React'];

	constructor(private _httpService : HttpAPIService, private _alert: AlertsService, private _userservice : UserService, private _historysearch : HistorySearchService) {
		console.log(_userservice.getCurrentUser())
		console.log(_historysearch.getLastSearches())
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

	getData(observatory, table : Array<any>) {
		let instance = this;
		this._httpService.getEntryJSON(observatory)
		.subscribe(
			function(response) { // The communication with the API has matched
				console.log(response); // Transform js object into json
				let obj = response.dictionary.entries;
				for (let prop in obj){ table.push(table == instance.modules ? JSON.parse(obj[prop].value) : obj[prop]);}
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
		return this.word != "";
	}

	insertNewData() {
		let instance = this;
		if (this.newModule) {
			let modules = instance.newModules.split(',');
			this._httpService.postEntryJSON(modules, AppSettings.API_MODULES, instance.newModules, instance._userservice.getCurrentUser().secretKey)
			.subscribe()
		}
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
		if (this.validated()) {
			let instance = this;
			this.loading = true;
			
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
			
			let dataInfo = {name : this.word, type: $('#select-types').text() == "Aucun" ? "" :  $('#select-types').text(), source : this.source, modules : modulesNotNew, definition: this.definition, meaning : this.meaning, context :  $('#select-context').text() == "Aucun" ? "" : $('#select-context').text(), commentary : "", review : ""};
			instance._httpService.postEntryJSON(dataInfo, AppSettings.API_WORDS, dataInfo.name, instance._userservice.getCurrentUser().secretKey)
			.subscribe(
				function(response) { // The communication with the API has matched
					instance._httpService.postEntryMetadata(AppSettings.API_METASEARCHCLICK, 0, response, instance._userservice.getCurrentUser().secretKey) // Put searchClick to 0
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