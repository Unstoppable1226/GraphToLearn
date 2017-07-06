import { Component, AfterViewInit } from '@angular/core';
import { HttpAPIService } from '../api/app.http-service';
declare var $:any;

@Component({
	selector: 'app-insertion',
	templateUrl: './app.insertion.html',
	styleUrls: ['./app.insertion.css'],
	providers: [HttpAPIService]
})

export class AppInsertion {
	public new = false;
	
	public styleModuleNew = '#EEE';
	public styleModuleNewCol = 'black';
	public styleModuleEx = '#333';
	public styleModuleExCol = 'white';
	public data = {};
	word : string = '';

	constructor(private _httpService : HttpAPIService) {}

	ngAfterViewInit(){
		$('.ui.dropdown').dropdown();
	}

	saveInsertion() {
		let dataInfo = {name : this.word};
		this._httpService.postJSON(dataInfo)
			.subscribe(data => this.data = data);
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