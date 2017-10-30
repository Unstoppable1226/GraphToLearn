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
import { User } from '../model/user';
import { EntryCowaboo } from '../model/entrycowaboo';
import { Comment } from '../model/comment';

declare var $: any; // This enables to use Jquery inside angular 2 app


@Component({
	selector: 'app-home',
	templateUrl: './app.home.html',
	styleUrls: ['./app.home.css'],
})

export class AppHome implements OnInit {

	public title: string // Title of the App
	public user : User
	public searchWord: string // Word that i want to search
	public content: string[] // That stores all the content in function of the word that i want to search
	public timeEstimated: string // Estimates the time necessary for the insertion with a file
	public nbEntries : string
	public showImageStructure : boolean
	public canInsert : boolean
	public errorStructureFile : boolean
	public textErrorStructureFile : string
	public isInserting : boolean
	public attributeErrorEmpty : string

	constructor(private _httpService: HttpAPIService, private _wordsservice: WordsService, private _historyservice: HistorySearchService, private _alert: AlertsService, private _format: Formatter, private _router: Router, private _authservice: AuthService, private _userservice: UserService) {
		this._format.deleteAllModals() // This is necessary for the modal system. That cleans every modal to avoid bugs
	}

	ngOnInit() {
		this.initVariables()
		this._wordsservice.getWords() // Stores all the words to upgrade the search performances
		this._wordsservice.getModules() // Stores all the modules to upgrade the search performances
		this._wordsservice.getUsers() // Stores all the users to upgrade the search performances
	}

	showImage() {
		this.showImageStructure = !this.showImageStructure
		setTimeout(function() {
			$('#modalInsertionFile').modal('refresh');
		}, 1);
	}

	initVariables() {
		this.user = new User()
		this.title = AppSettings.TITLE
		this.searchWord = ""
		this.content = []
		this.timeEstimated = ""
		this.showImageStructure = true
		this.canInsert = false
		this.nbEntries = ""
		this.errorStructureFile = false
		this.textErrorStructureFile = ""
		this.isInserting = false
		this.attributeErrorEmpty = ""
	}

	insertWithFile() { 
		let instance = this;
		$('#modalInsertionFile').modal('show'); 
		setTimeout(function() {
			$('#modalInsertionFile').modal('refresh');
		}, 1);
	}

	updateInfosFile(canInsert, timeEstimated, nbEntries?: number) {
		this.canInsert = true
		this.timeEstimated = timeEstimated
		if (nbEntries)
			this.nbEntries = nbEntries + " entrée" + (nbEntries > 1 ? "s": "") + "."
		else
			this.nbEntries = timeEstimated
	}

	updateErrorsFile(errorStructureFile, textErrorStructureFile) {
		this.errorStructureFile = errorStructureFile
		this.textErrorStructureFile = textErrorStructureFile
	}

	isObjectValid(object){
		let keys = Object.keys(object)
		for (let index = 0; index < AppSettings.ATTRIBUTES_REQUIRED_FOR_OBJECT.length; index++) {
			let element = AppSettings.ATTRIBUTES_REQUIRED_FOR_OBJECT[index];
			if (!keys.includes(element)) { this.attributeErrorEmpty = element; return false }
		}
		return true
	}

	fileChanged() {
		let instance = this, fileReader = new FileReader(), file = (<HTMLInputElement>document.getElementById("my-file")).files[0];
		$('p.file-return').text(file.name)
		fileReader.readAsText(file); //try to read file, this part does not work at all, need a solution
		fileReader.onload = function (e) {
			try {
				let obj = JSON.parse(this.result)
				instance.updateInfosFile(true, "~ 5 secondes", Object.keys(obj).length)
				instance.updateErrorsFile(false, "La structure de votre fichier est correcte !")
				let keys = Object.keys
				let arrayWords = {}
				for (let prop in obj) {
					let element: any = obj[prop];
					if (!instance.isObjectValid(element)) {
						instance.updateErrorsFile(true, "La structure de votre fichier n'est pas correcte, il manque des champs obligatoire pour l'entrée : " + element.name)
						break;
					}
				}
			} catch (error) {
				instance.updateInfosFile(false, "Fichier invalide")
				instance.updateErrorsFile(true, "Fichier invalide")
				alert('Votre fichier n\' est pas un fichier JSON valide !')
			}
		}
	}

	exists(name1, a2) {
		for (let x = 0; x < a2.length; x++) {
			if (name1.toLowerCase() == a2[x].name.toLowerCase().trim()) {
				return true;
			}
		}
		return false;
	}

	prepareObjects(data, allWords) {
		for (var index = 0; index < data.length; index++) {
			var element = data[index];
			element.meaning = element.meaning.replace(/&/g, "And")
			let name = element.name.toLowerCase().trim()			
			element.author = (element.author == undefined ? this._userservice.currentUser.mail : element.author)
			element.review = (element.review == undefined ? "x" : element.review)
			element.timestampCreation = (element.timestampCreation == undefined ? this._format.getTodayTimestamp() : element.timestampCreation)
			element.cpte = (element.cpte == undefined ? "1" : element.cpte)
			element.ict = (element.ict == undefined ? "" : element.ict)
			element.parent = (element.parent == undefined ? "" : element.parent)
			element.commentary = (element.commentary == undefined ? "" : element.commentary)
			element.keywords = (element.keywords == undefined ? "" : element.keywords)
			element.searchClick = (element.searchClick == undefined ? 0 : element.searchClick)
			element.updates = (element.updates == undefined ? [] : element.updates)
			element.comments = (element.comments == undefined ? [] : element.comments)
			element.like = (element.like == undefined ? [] : element.like)
			element.dislike = (element.dislike == undefined ? [] : element.dislike)
			element.inactive = (element.inactive == undefined ? false : element.inactive)
			allWords[name] = element
		}
		return allWords
	}

	saveInsertFile() {
		let instance = this, file = (<HTMLInputElement>document.getElementById("my-file")).files[0], fileReader = new FileReader();
		instance.isInserting = true
		fileReader.readAsText(file); //try to read file, this part does not work at all, need a solution
		fileReader.onload = function (e) {
			let data = JSON.parse(this.result), allWords = {}
		
			instance._httpService.getEntryJSON(AppSettings.API_WORDSNEW)
			.subscribe( words => {
				allWords = JSON.parse(words.dictionary.entries[Object.keys(words.dictionary.entries)[0]].value)
				allWords = instance.prepareObjects(data, allWords)
				instance._httpService.postEntryJSON(allWords, AppSettings.API_WORDSNEW, AppSettings.TAGALLWORDS, instance._userservice.currentUser.secretKey)
				.subscribe(
					res=> {
						console.log(res)
						instance.isInserting = false;
						$('#modalInsertionFile').modal('hide');
						instance._alert.create('success', "L'insertion des entrées est un succès !")
					}
				)
			})
		}
	}

	eventHandler(keyCode) {
		if (keyCode != 13) { return; }
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
					url: AppSettings.API_OBSERVATORY + "?observatoryId=" + AppSettings.API_WORDSNEW, // Communication avec l'API Cowaboo
					onResponse: function (response) {
						
						instance.content.splice(0, instance.content.length) // Vider le tableau
						let responseSearch = {
							results: [] // Tableau qui contient les résultats
						}
						let obj = JSON.parse(response.dictionary.entries[Object.keys(response.dictionary.entries)[0]].value);
						
						for (let prop in obj) {
							if (prop.toLowerCase().trim().startsWith(instance.searchWord.toLowerCase().trim())) {
								instance.content.push(obj[prop]);
							}
							/*
							let tag = obj[prop].tags; // Récupère le tag lié à l'entrée
							if (tag.toLowerCase().trim().startsWith('||' + instance.searchWord.toLowerCase().trim())) { // Algorithme de recherche
								instance.content.push(obj[prop].value);
							}*/
						}
						instance.content.forEach(function (item) {
							//let itemObj = JSON.parse(item);
							let itemObj : any = item;
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
				maxResults: 15, // Affiche 10 résultats maximum
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