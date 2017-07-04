import { Component, AfterViewInit } from '@angular/core';
declare var $:any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})

export class AppComponent {
	title = 'GraphToLearn';
	content = [
		{ title: 'Andorra' },
		{ title: 'United Arab Emirates' },
		{ title: 'Afghanistan' },
		{ title: 'Antigua' },
		{ title: 'Anguilla' },
		{ title: 'Albania' },
		{ title: 'Armenia' },
		{ title: 'Netherlands Antilles' },
		{ title: 'Angola' },
		{ title: 'Argentina' },
		{ title: 'American Samoa' },
		{ title: 'Austria' },
		{ title: 'Australia' },
		{ title: 'Aruba' },
		{ title: 'Aland Islands' },
		{ title: 'Azerbaijan' },
		{ title: 'Bosnia' },
		{ title: 'Barbados' },
		{ title: 'Bangladesh' },
		{ title: 'Belgium' },
		{ title: 'Burkina Faso' },
		{ title: 'Bulgaria' },
		{ title: 'Bahrain' },
		{ title: 'Burundi' }
	];
	ngAfterViewInit(){
		$('.ui.search').search({
		    	source: this.content
		});
	}
	search() {
		this.title = 'Nouveau titre';
	}
}
