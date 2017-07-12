import { Component, AfterViewInit } from '@angular/core';
import { HttpAPIService } from '../api/app.http-service';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';
import { AppSettings } from '../settings/app.settings';
import { OnInit } from '@angular/core';

declare var $:any; // This is necessary if you want to use jQuery in the app

@Component({
	selector: 'app-insertion',
	templateUrl: './app.insertion.html',
	styleUrls: ['./app.insertion.css'],
	providers: [HttpAPIService]
})

export class AppInsertion implements OnInit {
	public newModule = false;
	public loading = false;
	public styleModuleNew = AppSettings.WHITEMOREDARK;
	public styleModuleNewCol = AppSettings.BLACK;
	public styleModuleEx = AppSettings.GREY;
	public styleModuleExCol = AppSettings.WHITE;
	public data = {};
	public word : string = '';
	public newModules : string = '';
	public types = [];
	public source : string = ""; // Separate with the comma
	public definition : string = ""; 
	public explications : string = "";
	public contexts = [];
	public modules = [];

	constructor(private _httpService : HttpAPIService, private _alert: AlertsService) {}

	ngAfterViewInit(){
		$('.ui.dropdown').dropdown();
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
		this._httpService.getTagsJSON()
		.subscribe(
			function(response) { // The communication with the API has matched
				console.log(JSON.stringify(response)); // Transform js object into json
				console.log(response.tag_list.list.Modules); // Get every modules
				console.log(response.tag_list.list.Types);
			},
		)
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
			this.insertNewData();
			let dataInfo = {name : this.word, type: $('#select-types').text(), source : this.source, modules : this.newModules, definition: this.definition, explications : this.explications, context :  $('#select-context').text(), commentary : "", review : ""};
			this._httpService.postEntryJSON(dataInfo, AppSettings.API_WORDS, dataInfo.name)
			.subscribe(
				function(response) { // The communication with the API has matched
					instance.loading = false; 
					instance._alert.create('success', AppSettings.MSGSUCCESS)
					data => this.data = data
					instance.reinit();
				},
				// The communication with the API has not matched
				function(error) {instance.loading = false; instance._alert.create('error', AppSettings.MSGERROR); },
			);
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