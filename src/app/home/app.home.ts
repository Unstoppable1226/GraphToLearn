import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
declare var $:any;


@Component({
	selector: 'app-home',
	templateUrl: './app.home.html',
	styleUrls: ['./app.home.css'],
})

export class AppHome{
	public id = "";
	searchWord : string = "";
	content = [];
	
	constructor(private _httpService : HttpAPIService) {}

	insertWithFile() {

	}


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
							url         : 'http://localhost:4200/search/' + itemObj.name
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