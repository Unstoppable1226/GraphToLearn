import { Component, AfterViewInit } from '@angular/core';
declare var $:any;

@Component({
	selector: 'app-insertion',
	templateUrl: './app.insertion.html',
	styleUrls: ['./app.insertion.css'],
})

export class AppInsertion {
	public new = false;
	public styleModuleNew = '#EEE';
	public styleModuleNewCol = 'black';
	public styleModuleEx = '#333';
	public styleModuleExCol = 'white';


	ngAfterViewInit(){
		$('.ui.dropdown')
		  	.dropdown()
		;
	}

	switchModule(val, choice) {
		this.new = val;
		this.styleModuleNew = (choice == 'A' ? '#EEE' : '#333');
		this.styleModuleNewCol = (choice == 'A' ? 'black' : 'white');
		this.styleModuleEx = (choice == 'B' ? '#EEE' : '#333');
		this.styleModuleExCol = (choice == 'B' ? 'black' : 'white');
	}
}