/* Core */
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';

/* API Service */
import { HttpAPIService } from '../api/app.http-service';

/* Constants */ 
import { AppSettings } from '../settings/app.settings';

/* Alerts */
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

/* Services */
import { AuthService } from '../login/app.authservice';
import { UserService } from '../model/user-service';
import { WordsService } from '../model/words-service';
import { HistorySearchService } from '../model/history-search';

/* Tools */
import { Formatter } from '../tools/app.formatter';

/* Models */
import { EntryCowaboo } from '../model/entrycowaboo';
import { Comment } from '../model/comment';

declare var $: any; // This enables to use Jquery inside angular 2 app


@Component({
	selector: 'app-home',
	templateUrl: './app.home.html',
	styleUrls: ['./app.home.css'],
})

export class AppHome implements OnInit {

	public title : string // Title of the App
	public searchWord: string // Word that i want to search
	public content : string[] // That stores all the content in function of the word that i want to search
	public timeEstimated : string // Estimates the time necessary for the insertion with a file

	constructor(private _httpService: HttpAPIService, private _wordsservice : WordsService, private _historyservice : HistorySearchService, private _alert : AlertsService, private _format : Formatter, private _router: Router, private _authservice: AuthService, private _userservice: UserService) {
		this._format.deleteAllModals() // This is necessary for the modal system. That cleans every modal to avoid bugs
	}

	ngOnInit() {
		this.initVariables()
		this._historyservice.getLastSearches() // Get the last searches did by the current user
		this._userservice.getCurrentUser() // Promise that permits to initialize the current user
		this._wordsservice.getWords() // Stores all the words to upgrade the search performances
		this._wordsservice.getModules() // Stores all the modules to upgrade the search performances
		this._wordsservice.getUsers() // Stores all the users to upgrade the search performances
	}

	initVariables() {
		this.title = AppSettings.TITLE
		this.searchWord = ""
		this.content = []
		this.timeEstimated = ""
	}

	insertWithFile() { $('#modalInsertion').modal('show'); }

	fileChanged() {
		let instance = this;
		let file = (<HTMLInputElement>document.getElementById("my-file")).files[0];		
		$('p.file-return').text(file.name)
		let fileReader = new FileReader();
		fileReader.readAsText(file); //try to read file, this part does not work at all, need a solution
		
		fileReader.onload = function(e) {
			let obj = JSON.parse(this.result)
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
				$('#modalInsertion').modal('hide');
				instance._alert.create('error', "Cette fonctionnalitée a été désactivée, car elle est encore dans l'état expérimentale");
				console.log('expérimental')
			}
		}
	}

	eventHandler(keyCode) {
		if (keyCode != 13) {return;}
		if (this.searchWord != "") { this.moveToSearch(this.searchWord) }
	}

	moveToSearch(result) {
		let name = result.replace(/\//g, AppSettings.FORWARD_SLACH);
		name = name.replace(/\(/g, AppSettings.OPEN_PARENTHESIS).replace(/\)/g, AppSettings.CLOSE_PARENTHESIS)
		this._router.navigate(['search/' + name])
	}

	ngAfterViewInit() {
		let instance = this;
		$('.ui.search.searchWord')
		.search({
			apiSettings: {
				url: AppSettings.API_OBSERVATORY + "?observatoryId=" + AppSettings.API_WORDS, // Communication avec l'API Cowaboo
				onResponse: function (response) {
					instance.content.splice(0, instance.content.length) // Vider le tableau
					let responseSearch = {
						results: [] // Tableau qui contient les résultats
					}
					let obj = response.dictionary.entries;
					for (let prop in obj) {
						let tag = obj[prop].tags; // Récupère le tag lié à l'entrée
						if (tag.toLowerCase().trim().startsWith('||' + instance.searchWord.toLowerCase().trim())) { // Algorithme de recherche
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
			minCharacters: 1, // 1 caractère minimum pour déclencher l'algorithme de recherche
			maxResults : 15, // Affiche 10 résultats maximum
			searchDelay: 300,
			searchFields: [
				'title',
			],
			onSelect(result, response) {
				instance.moveToSearch(result.name)
			}
		});
	}
}

/*instance._httpService.getEntryJSON(AppSettings.API_WORDS)
	.subscribe(function(res){
		let words = res.dictionary.entries
		let cpt = 0;
		/*
		for (let prop in words) {
			let el = JSON.parse(words[prop].value)
			if (cpt < 6 && (el.keywords == undefined)) {

				let modules = el.modules.replace(/\.0/g,"")
				let tags = (el.keywords == undefined ? "" : el.keywords)
				let comments = []
				if (el.commentary.trim() != "") {
					comments.push(new Comment(el.commentary, "IDEC", el.timestampCreation, []))
				}
				let newValue = new EntryCowaboo(el.name, el.type.trim(), el.source.trim(), modules, el.definition.trim(), el.meaning, el.context.trim(), el.review.trim(), tags, el.parent.trim(), el.timestampCreation, [], comments, false, el.commentary)
				instance._httpService.putEntryJSON(newValue, AppSettings.API_WORDS, prop, instance._userservice.currentUser.secretKey)
				.subscribe(
					hashGenerated => {
						console.log(hashGenerated);
					},
					e => {console.log(e)}
				)	
				
			}
			cpt++;
		}
		*/
		/*let obj = res.dictionary.entries
		let i = 0;
		
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
		}*/
		//console.log(tab)
		/*for (var cpt = 0; cpt < tab.length; cpt++) {
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
//})