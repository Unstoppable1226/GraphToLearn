import { Component, AfterViewInit } from '@angular/core';
import { AppSettings } from './settings/app.settings';
import { HttpAPIService } from './api/app.http-service';

declare var $:any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [HttpAPIService]
})

export class AppComponent {
	public title = AppSettings.TITLE;
	public searchWord : string = "";
	public content = [];

	constructor(private _httpService : HttpAPIService) {}

	ngAfterViewInit() {
		let instance = this;
		$('.ui.search.searchWord')
		.search({
			apiSettings: {
				url: AppSettings.API_OBSERVATORY + "?observatoryId=" + AppSettings.API_WORDS,
				onResponse: function(response) {
					instance.content.splice(0,instance.content.length)
					let responseSearch = {
						results : []
					}
					let obj = response.dictionary.entries;
					for (let prop in obj){ 
						let tag = obj[prop].tags;
						console.log(tag);
						if (tag.toLowerCase().includes(instance.searchWord.toLowerCase())) {
							instance.content.push(obj[prop].value);
						}
					}
					instance.content.forEach(function(item){
						let itemObj = JSON.parse(item);
						responseSearch.results.push({
							title       : itemObj.name,
							description : itemObj.explications,
							url         : itemObj.context
						});
					});
					console.log(responseSearch);
					return responseSearch;
				}
			},
			minCharacters : 1
		});
	}
}


