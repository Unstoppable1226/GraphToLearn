import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';
import { AuthService } from '../login/app.authservice';
import { UserService } from '../model/user-service';
//import { Observable } from 'rxjs/Observable';
import { Observable } from 'rxjs/Rx';
import { Router} from '@angular/router';

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
	timeEstimated = ""

	constructor(private _httpService: HttpAPIService, private _alert : AlertsService, private _router: Router, private _authservice: AuthService, private _userservice: UserService) {
		this._userservice.getCurrentUser()
			.then(
				resolve => {
					console.log(resolve)
				}
			)
		
	}

	insertWithFile() {
		$('#modalInsertion').modal('show');
		this._httpService.getEntryJSON(AppSettings.API_WORDS)
		.subscribe(function(res){
			console.log(Object.keys(res.dictionary.entries).length)
		})
	}

	fileChanged() {
		let instance = this;
		var file = (<HTMLInputElement>document.getElementById("my-file")).files[0];		
		$('p.file-return').text(file.name)
		var fileReader = new FileReader();
		fileReader.readAsText(file);
		//try to read file, this part does not work at all, need a solution
		fileReader.onload = function(e) {
			var obj = JSON.parse(this.result)
			console.log(obj)
			instance.timeEstimated = "~ " + Math.floor(obj.data.length / 12) + " minutes"
		}
	} 

	exists(name1, a2) {
		for(let x = 0; x < a2.length; x++) {
			if (name1.toLowerCase() == a2[x].name.toLowerCase().trim()) {
				return true;
			}
		}
		return false;
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
				instance._alert.create('error', "Cette fonctionnalitée a été désactivée, car elle est encore dans l'état expérimentale");
				console.log('expérimental')
				/*
				instance._httpService.getEntryJSON(AppSettings.API_WORDS)
					.subscribe(function(res){
						console.log(Object.keys(res.dictionary.entries).length)
						let obj = res.dictionary.entries
						/*let i = 0;
						
						let a2 = []
						for (let prop in obj) {
							a2.push(JSON.parse(obj[prop].value))
						}
						//console.log(a2)
						let tab = []
						for (let i = 0; i < data.length; i++) {
							if (!instance.exists(data[i].name.trim(), a2)) {								
								tab.push(data[i])
							}
						}
						console.log(tab)
						for (var cpt = 0; cpt < tab.length; cpt++) {
							(function(index) {
								var element = tab[index];
								setTimeout(function() { 
									instance._httpService.postEntryJSON(element, AppSettings.API_WORDS, element.name, instance._userservice.getCurrentUser().secretKey)
									.subscribe(function(res) {
										console.log(res)
									})
								},cpt * 5000);
							})(cpt);
						} 
						
						for (let prop in obj) {
							(function(index) {
								i++
								var element = data[index];
								setTimeout(function() { 
									let tag = obj[prop].tags;
									instance._httpService.postEntryMetadata(AppSettings.API_METASEARCHCLICK, 0, prop, instance._userservice.getCurrentUser().secretKey)
										.subscribe(function(res) {console.log(res)})
								}, i * 5000);
							})(i);
						} */
				/*
						let tab = []
						
						for (var i = 0; i < data.length; i++) {
							(function(index) {
								var element = data[index];
								setTimeout(function() { 
									instance._httpService.postEntryJSON(element, AppSettings.API_WORDS, element.name, instance._userservice.currentUser.secretKey)
									.subscribe(function(res) {
										console.log(res)
									})
								}, i * 5000);
							})(i);
						}
						/*Observable.forkJoin(tab).subscribe(t=> {
							console.log(t)
							for (var i = 0; i < t.length; i++) {
								console.log("valeur" + t[i])
								instance._httpService.postEntryMetadata(AppSettings.API_METASEARCHCLICK, 0, t[i], instance._userservice.getCurrentUser().secretKey)
									.subscribe(function(res){
										console.log(res)
									}) 
							}
						});*/
					/*})	*/
			
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
							if (tag.toLowerCase().trim().startsWith('||' + instance.searchWord.toLowerCase().trim())) {
								instance.content.push(obj[prop].value);
							}
						}
						instance.content.forEach(function (item) {
							let itemObj = JSON.parse(item);
							itemObj.modules = itemObj.modules.replace(/\.0/g,"")
							let modules = itemObj.modules.length > 1 ? " [" + (isNaN(parseInt(itemObj.modules)) ? itemObj.modules : itemObj.modules) + "]" : ""
							responseSearch.results.push({
								title: itemObj.name + modules,
								description: itemObj.meaning,
								name: itemObj.name
								/*url: AppSettings.URL_SEARCH + name*/
							});
						});
						return responseSearch;
					}
				},
				minCharacters: 1,
				maxResults : 10,
				onSelect(result, response) {
					let name = result.name.replace(/\//g, AppSettings.FORWARD_SLACH);
					name = name.replace(/\(/g, AppSettings.OPEN_PARENTHESIS).replace(/\)/g, AppSettings.CLOSE_PARENTHESIS)
					//name = name.replace(/\s/g,"%20")
					instance._router.navigate(['search/' + name])
				}
			});
	}
}