import { Component, AfterViewInit } from '@angular/core';
import { HttpAPIService } from '../api/app.http-service';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

declare var $:any;

@Component({
	selector: 'app-insertion',
	templateUrl: './app.insertion.html',
	styleUrls: ['./app.insertion.css'],
	providers: [HttpAPIService]
})

export class AppInsertion {
	public new = false;
	public search = false;
	public styleModuleNew = '#EEE';
	public styleModuleNewCol = 'black';
	public styleModuleEx = '#333';
	public styleModuleExCol = 'white';
	public data = {};
	word : string = '';

	constructor(private _httpService : HttpAPIService, private _alert: AlertsService) {}

	ngAfterViewInit(){
		$('.ui.dropdown').dropdown();
	}

	saveInsertion() {
		this.search = true;
		let instance = this;
		let dataInfo = {name : this.word};
		this._httpService.postJSON(dataInfo)
		.subscribe(
			function(response) {
				instance.search = false; 
				instance._alert.create('success', "Les informations ont été inséré avec succès")
			},
			function(error) {instance.search = false; instance._alert.create('error', "Un problème est survenu lors de l'insertion des données, Veuillez réessayer svp !"); },
			function() { data => this.data = data},
		);

	}

	switchModule(val, choice) {
		console.log(this.data);
		this.new = val;
		this.styleModuleNew = (choice == 'A' ? '#EEE' : '#333');
		this.styleModuleNewCol = (choice == 'A' ? 'black' : 'white');
		this.styleModuleEx = (choice == 'B' ? '#EEE' : '#333');
		this.styleModuleExCol = (choice == 'B' ? 'black' : 'white');
	}
}