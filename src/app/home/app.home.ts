import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { AuthService } from '../login/app.authservice';
import { UserService } from '../model/user-service';
import { Observable } from 'rxjs/Observable';

declare var $: any;


@Component({
	selector: 'app-home',
	templateUrl: './app.home.html',
	styleUrls: ['./app.home.css'],
})

export class AppHome {
	public id = "";
	searchWord: string = "";
	content = [];
	private isConnected = false;
	title = AppSettings.TITLE;

	constructor(private _httpService: HttpAPIService, private _authservice: AuthService, private _userservice: UserService) {
		console.log(this._userservice.getCurrentUser());
	}

	insertWithFile() {
		$('#modalInsertion').modal('show');
	}

	fileChanged() {
		var file = (<HTMLInputElement>document.getElementById("my-file")).files[0];		
		$('p.file-return').text(file.name)
	}

	saveInsertFile() {
		let instance = this;
		var file = (<HTMLInputElement>document.getElementById("my-file")).files[0];
		var fileReader = new FileReader();
		fileReader.readAsText(file);
		//try to read file, this part does not work at all, need a solution
		fileReader.onload = function(e) {
			var obj = JSON.parse(this.result)
			var data = obj.data
			if (data == undefined) {
				alert('Attention data doit être le premier objet présent')
			} else {
				for (var index = 0; index < data.length; index++) {
					var element = data[index];
					instance._httpService.postEntryJSON(element, AppSettings.API_WORDS, element.name)
						.subscribe(function(res) {// The communication with the API has matched
							instance._httpService.postEntryMetadata(AppSettings.API_METASEARCHCLICK, 0, res) // Put searchClick to 0
							.subscribe(
								function(resp) {
									console.log(resp)
									console.log(index)
								}	
							)
						})
				}
			}
		}
	}

	ngAfterViewInit() {
		let instance = this;
		$('.ui.search.searchWord')
			.search({
				apiSettings: {
					url: AppSettings.API_OBSERVATORY + "?observatoryId=" + AppSettings.API_WORDS,
					onResponse: function (response) {
						instance.content.splice(0, instance.content.length)
						let responseSearch = {
							results: []
						}
						let obj = response.dictionary.entries;
						for (let prop in obj) {
							let tag = obj[prop].tags;
							console.log(tag);
							if (tag.toLowerCase().includes(instance.searchWord.toLowerCase())) {
								instance.content.push(obj[prop].value);
							}
						}
						instance.content.forEach(function (item) {
							let itemObj = JSON.parse(item);
							responseSearch.results.push({
								title: itemObj.name,
								description: itemObj.meaning,
								url: 'http://localhost:4200/search/' + itemObj.name
							});
						});
						console.log(responseSearch);
						return responseSearch;
					}
				},
				minCharacters: 1
			});
	}
}