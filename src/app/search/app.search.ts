import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';

@Component({
	selector: 'app-search',
	templateUrl: './app.search.html',
	styleUrls: ['./app.search.css'],
})

export class AppSearch{

	public id = "";
	public info = {};

	constructor(private _route : ActivatedRoute, _httpservice : HttpAPIService) {
		let instance = this;
		instance._route.params.subscribe(routeParams => {
		  	instance.id = routeParams.id;
		  	if (instance.id != undefined) {
			  	_httpservice.getEntryJSON(AppSettings.API_WORDS)
			  	.subscribe(
			  		function(response) { 
				  		let obj = response.dictionary.entries;
						for (let prop in obj){ 
							let tag = obj[prop].tags;
							console.log(tag);
							if (tag.toLowerCase().includes(instance.id.toLowerCase())) {
								instance.info = JSON.parse(obj[prop].value);
							}
						}
					}
			  	)
		  	}
		})
	}

}