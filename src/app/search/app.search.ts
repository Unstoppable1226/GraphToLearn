import { Component, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AppComponent } from '../app.component';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { Manager3D } from '../3D/app.components3d'

import { Entry } from '../model/entry'
import { User } from '../model/user'
import { UserService } from '../model/user-service'
import { HistorySearchService } from '../model/history-search'

import { Router} from '@angular/router';

declare var dat: any;
declare var $: any;
declare var moment:any;

@Component({
	selector: 'app-search',
	templateUrl: './app.search.html',
	styleUrls: ['./app.search.css'],
})

export class AppSearch {

	public id = "";
	public loading = false
	public loading2 = false
	public wordSearch : Entry = new Entry()// The that we have searched
	public wordSel: Entry = new Entry() // The word that is selected on the context
	public hashWordSel : string = ""
	public dictionary = []
	public context
	public contextEntrys : Array<Entry> = []
	public collapsedMeaning = false
	public collapsedInfos = false
	public collapsedComments = true
	public collapsedActions = true
	private user: User
	private likes = []
	private dislikes = []
	private canLike : boolean = false;
	private canDislike : boolean = false;
	public canVote : boolean = false;
	private allModules = []
	private modulesOfWord = {}
	private totalPoints = 0
	public col1 = AppSettings.COL_SEARCH_TERM
	public col2 = AppSettings.COL_KEY_WORDS
	public col3 = AppSettings.COL_MODULE
	public col4 = AppSettings.COL_OTHER_TERMS

	constructor(private _route: ActivatedRoute,private _router : Router, private _httpservice: HttpAPIService, private _format: Formatter, private _manager3d: Manager3D, private _userservice: UserService, public _historysearch : HistorySearchService) {
		let instance = this;
		delete (instance._manager3d)
		instance._manager3d = new Manager3D(_format)
		this.loading = true;
		instance._httpservice.getEntryJSON(AppSettings.API_MODULES)
		.subscribe(function(modules) {
			let obj = modules.dictionary.entries;
			for (let prop in obj) {
				instance.allModules.push(JSON.parse(obj[prop].value))
			}
		})
		instance.user = instance._userservice.getCurrentUser()
		instance._route.params.subscribe(routeParams => {
			instance.id = routeParams.id;
			instance.id = instance.id.replace(AppSettings.FORWARD_SLACH, "/");
			instance.id = instance.id.replace(AppSettings.OPEN_PARENTHESIS, "(");
			instance.id = instance.id.replace(AppSettings.CLOSE_PARENTHESIS, ")");
			if (instance.id != undefined) {
				instance._historysearch.addSearch(instance.id)
				_httpservice.getEntryJSON(AppSettings.API_WORDS)
					.subscribe(function (response) {
						instance.initializeWordSearch(instance, response)
					})
			}
		})
	}
	refresh() {
		this.id = "";
		this.loading = false
		this.loading2 = false
		this.wordSearch = new Entry()// The that we have searched
		this.wordSel= new Entry() // The word that is selected on the context
		this.hashWordSel = ""
		this.collapsedMeaning = false
		this.collapsedInfos = false
		this.collapsedComments = true
		this.collapsedActions = true
		this.canLike  = false;
		this.canDislike= false;
		this.canVote  = false;
		this.modulesOfWord = {}
		this.totalPoints = 0
		this.col1 = AppSettings.COL_SEARCH_TERM
		this.col2 = AppSettings.COL_KEY_WORDS
		this.col3 = AppSettings.COL_MODULE
		this.col4 = AppSettings.COL_OTHER_TERMS
		this.likes = []
		this.dislikes = []
		this.allModules = []
		this.dictionary = []
		this.contextEntrys = []
	}
	
	backToHome() {
		this.refresh()
		this._router.navigate(['/home'])
	}

	like() { this.likeDislike(AppSettings.API_METALIKE, this.likes, this.canLike, 0, this.wordSearch.like) }

	dislike() { this.likeDislike(AppSettings.API_METADISLIKE, this.dislikes, this.canDislike, 1, this.wordSearch.dislike) }

	likeDislike(metadata, variable, can, nb, objectIncDec) {
		let instance = this;
		if (nb==0) {
			instance.loading = true
		} else {
			instance.loading2 = true
		}
		
		if (can) {
			if (nb == 0) {
				instance.likes.push(instance._userservice.getCurrentUser().mail)
			} else {
				instance.dislikes.push(instance._userservice.getCurrentUser().mail)
			}
			
			instance._httpservice.postEntryMetadata(metadata, JSON.stringify(nb == 0 ? instance.likes : instance.dislikes), instance.hashWordSel, instance._userservice.getCurrentUser().secretKey)
			.subscribe(function(res) {
				console.log(res)
				if (nb == 0) {
					instance.wordSearch.like.number += 1
					instance.canLike = false
					instance.loading = false
					instance._httpservice.getUsers()
					.subscribe(
						data => {
							instance._httpservice.postBalance(instance._userservice.getCurrentUser().publicKey,instance._userservice.getCurrentUser().secretKey, data.user_list.list[instance.wordSel.author.name], (1 -(0.25 * 0)))
							.subscribe(function(balance){
								console.log(balance)
							})
						},
						error => {}
					)
				} else {
					instance.wordSearch.dislike.number += 1
					instance.canDislike = false
					instance.loading2 = false
				}
			})
		} else {
			if (nb == 0) {
				instance.likes.splice(instance.likes.indexOf(instance._userservice.getCurrentUser().mail), 1)
			} else {
				instance.dislikes.splice(instance.dislikes.indexOf(instance._userservice.getCurrentUser().mail), 1)
			}
			instance._httpservice.postEntryMetadata(metadata, JSON.stringify(nb == 0 ? instance.likes : instance.dislikes), instance.hashWordSel, instance._userservice.getCurrentUser().secretKey)
			.subscribe(function(res) {
				console.log(res)
				if (nb == 0) {
					instance.wordSearch.like.number -= 1
					instance.canLike = true
					instance.loading = false
				} else {
					instance.wordSearch.dislike.number -= 1
					instance.canDislike = true
					instance.loading2 = false
				}
			})
		}
	}

	findUser(tabLikes) {
		let user = this._userservice.getCurrentUser()
		for (let i = 0; i < tabLikes.length; i++) {
			if (user.mail.toLowerCase() == tabLikes[i].toLowerCase()) {
				return true;
			}
		}
		return false
	}

	constructLikeDislike(tab, nb, can) {
		console.log(tab)
		if (tab == undefined) {
			can = true;
		} else {
			if (nb == 0) {
				try {
					this.likes = JSON.parse(tab)
				} catch(e) {
					this.likes = tab
				}
				can = !this.findUser(this.likes)
				this.wordSearch.like.number = this.likes.length;
			} else {
				try {
					this.dislikes = JSON.parse(tab)
				} catch(e) {
					this.dislikes = tab
				}
				can = !this.findUser(this.dislikes)
				this.wordSearch.dislike.number = this.dislikes.length;
			}
		}
		return can;
	}

	getSameModule(word) {
		var element;
		for (var index = 0; index < this.allModules.length; index++) {
			element = this.allModules[index];
			if (element.id == word) {
				element.reputation = Math.floor(Math.random() * 10) + 1  
				element.color = element.reputation >= 7 ? "#16ab39" :  element.reputation > 4 ? "#eaae00" : "#db2828"
				element.animationLeft = "loading-" + (element.reputation >= 5 ? (element.reputation - 5)*2: 0) +" 0.5s linear forwards"
				element.animationRight = "loading-" + (element.reputation >= 5 ? 10 : element.reputation * 2) + " 0.5s linear forwards"
				this.modulesOfWord[element.id] = element
			}
		}
	}

	getAllWordsOfModules(response) {
		let obj = response.dictionary.entries;
		let entry
		let objInsert
		for (let prop in this.modulesOfWord) {
			var element = this.modulesOfWord[prop];
			element.allterms = [];
		}

		for (let prop in obj) {
			entry = JSON.parse(obj[prop].value)
			for (let props in this.modulesOfWord) {
				var element = this.modulesOfWord[props];
				if (entry.modules.includes(element.id.trim())) {
					objInsert = new Entry()
					objInsert.setData(JSON.parse(obj[prop].value));
					objInsert.searchClick = obj[prop].conf[AppSettings.API_METASEARCHCLICK] == undefined || obj[prop].conf[AppSettings.API_METASEARCHCLICK] == 'NaN'? 0 : obj[prop].conf[AppSettings.API_METASEARCHCLICK]
					objInsert.timestampCreation = this._format.getDate(obj[prop].date);
					objInsert.author = { name: obj[prop].author, search: "" };
					element.allterms.push(objInsert)
				}
			}
		}
	}

	initializeWordSearch(instance, response) {
		let obj = response.dictionary.entries;
		for (let prop in obj) {
			let tag = obj[prop].tags;
			instance.dictionary.push(obj[prop]);
			if (tag.trim().toLowerCase() == "||"+instance.id.trim().toLowerCase()+"||") {
				/* Il faudrait mettre à jour un compteur pour la recherche */
				let nbSearch: number = Number(obj[prop].conf.searchClick)
				nbSearch += 1
				instance.hashWordSel = prop;
				instance.canLike = instance.constructLikeDislike(obj[prop].conf.like, 0 ,instance.canLike)
				instance.canDislike = instance.constructLikeDislike(obj[prop].conf.dislike, 1, instance.canDislike)
				instance.wordSearch.setData(JSON.parse(obj[prop].value));
				instance.wordSearch.searchClick = nbSearch
				instance.wordSearch.timestampCreation = instance._format.getDate(obj[prop].date);
				instance.wordSearch.author = { name: obj[prop].author, search: "" };
				instance.canVote = instance.wordSearch.author.name.trim().toLowerCase() != instance._userservice.getCurrentUser().mail.trim().toLowerCase()
				instance.wordSearch.modules.id = instance.wordSearch.modules.id.replace(/\.0/g, "")

				instance.wordSearch.modules.id = instance.wordSearch.modules.id.includes(',') ? instance.wordSearch.modules.id.split(',') : instance.wordSearch.modules.id.split('-')

				for(let i = 0; i< instance.wordSearch.modules.id.length; i++) {
					instance.getSameModule(instance.wordSearch.modules.id[i].trim())
				}
				
				instance.getAllWordsOfModules(response) 
				/*
				for (var index = 0; index < instance.modulesOfWord.length; index++) {
					var element = instance.modulesOfWord[index];
					instance._httpservice.postObservatoryMetadata(element.id, JSON.stringify(element.allterms), AppSettings.API_WORDS, instance._userservice.currentUser.secretKey)
					.subscribe(function(response){console.log(response);})
				}*/

				let tab : Array<string>= []
				instance._httpservice.getEntryJSON(AppSettings.API_HISTORY)
				.subscribe(
					data => {
						console.log(data)
						instance._historysearch.lastSearches = data.dictionary.conf[instance._userservice.currentUser.mail]
						if (data.dictionary.conf[instance._userservice.currentUser.mail] != undefined) {
							if (!data.dictionary.conf[instance._userservice.currentUser.mail].includes(instance.wordSearch.name)) {
								if (instance._historysearch.lastSearches == "[]") {
									instance._historysearch.lastSearches = []
								}
								instance._historysearch.addSearch(instance.wordSearch.name)
							}
						}
						instance._httpservice.postObservatoryMetadata(instance._userservice.currentUser.mail, JSON.stringify(instance._historysearch.getLastSearches()), AppSettings.API_HISTORY, instance._userservice.currentUser.secretKey)
						.subscribe(function(response){console.log(response);})
					},
					error => {}
				)
				instance.createContext(instance.wordSearch);
				instance._httpservice.postEntryMetadata(AppSettings.API_METASEARCHCLICK, nbSearch, prop, instance._userservice.getCurrentUser().secretKey) // Put searchClick to 0
					.subscribe(function (resp) {console.log(resp)});
			}
		}
	}

	hideOrShow(ev, id) {
		let el = ev.target.className != "close-button" ? ev.target.parentElement.parentElement.parentElement : ev.target.parentElement
		$(el.children[2]).toggleClass('collapse')
		if (id == 1) { this.collapsedInfos = !this.collapsedInfos; return }
		if (id == 2) { this.collapsedMeaning = !this.collapsedMeaning; return }
		if (id == 4) {
			$(ev.target.parentElement).toggleClass('collapse-actions')
			$(ev.target.parentElement.children[0]).toggleClass('collapse-actions-buttons')
			$(ev.target.parentElement.children[1]).toggleClass('collapse-actions-buttons')
			$(ev.target.parentElement.children[2]).toggleClass('collapse-actions-buttons')
			this.collapsedActions = !this.collapsedActions; 
			return 
		}
		this.collapsedComments = !this.collapsedComments
	}

	ngAfterViewInit() {
		this._manager3d.startEngine('renderCanvas');
		$('#popupReputation').popup()
	}

	findVerb(tag) {
		return tag.endsWith("dre") || tag.endsWith("pre") ||
			tag.endsWith("er") || tag.endsWith("oir") || tag.endsWith("ir")
			|| tag.endsWith("ttre") || tag == 'est' || tag == 'a' || tag.endsWith('é') || tag.endsWith('és')
	}

	findAbreviations(word) {
		return word == word.toUpperCase();
	}

	/* verbs with -er, -oir, -ir, -re */
	verbSelection(tags) {
		for (var i = tags.length - 1; i >= 0; i--) {
			if (this.findVerb(tags[i])) {
				tags.splice(i, 1);
			} else if (this.findAbreviations(tags[i])) {
				if (tags[i] != this.id) {
					let def = this._format.getDefinition(tags[i], this.dictionary)
					if (def != "") {
						let text = tags.toString().replace(/,/g, " ")
						text = text.replace(new RegExp(def, 'gmi'), '')
						tags = text.split(' ');
					}
				} else {
					tags.splice(i, 1); // we delete the tag binded to our search because we dont need it.
				}
			}
		}
		return tags;
	}

	searchSimilar(el, tags, i) {
		for (var index = 0; index < tags.length; index++) {
			var element = tags[index];
			if (index != i) {
				if (element.toLowerCase().startsWith(el.toLowerCase())) {
					return index
				}
			}
		}
		return -1;
	}

	sanitizeMeaningForZone() {
		let text = this.wordSearch.meaning;
		let table = AppSettings.articles.concat(AppSettings.connectors);
		let regex = new RegExp(this.wordSearch.definition, 'gmi');
		text = text.replace(regex, "");
		for (var i = table.length - 1; i >= 0; i--) {
			regex = new RegExp(" " + table[i] + " ", 'gmi'); // we delete all the worlds that are not important
			text = text.replace(regex, " ");
		}
		text = text.replace(/Le |La |Les |\(les |Si | l'| d'| qu'|\" | \"/g, " ");
		text = text.replace(/ \(|\)./g, " ");
		text = text.replace(/l\'/gi, "");
		let tags = this._format.splitter(text, [',', ' ', '. ', ':', ' - ', ';', '\n']);
		tags = this.verbSelection(tags);
		tags = this._format.cleanArray(tags);

		for (var index = 0; index < tags.length; index++) {
			var el = tags[index]
			tags[index] = el[el.length-1] != '.' ? el : el.substring(0, el.length-1)
			var pos = this.searchSimilar(el.substring(0,el.length-1), tags, index)
			if (pos != -1) {
				tags.splice(pos, 1)
			}
		}
		return tags;
	}

	numberTimesApparitions(explaination, arrayEntrys) {
		let name
		let count
		for (var i = arrayEntrys.length - 1; i >= 0; i--) {
			count = this._format.countSameWord(arrayEntrys[i].name, explaination);
			arrayEntrys[i].count = count;
		}
	}

	sortTags(arrayEntrys) {
		arrayEntrys.sort(function (a: Entry, b : Entry) { return a.count - b.count; }); // Sort
		if (arrayEntrys.length > 15) {
			let length = arrayEntrys.length
			arrayEntrys = arrayEntrys.slice(length - 15, length); // Take the 15 lasts 
		}
		return arrayEntrys
	}

	createRep1(wordSearch, entrys) {
		let totalPoints = this._format.getTotalCountWord(entrys);
		let nbTags = entrys.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		for (let i = entrys.length - 1; i >= 0; i--) {
			entrys[i].repRule1 = this._format.getReput(entrys[i].count, divisions) * AppSettings.COEFRULES[0]
		}
		entrys.sort(function (a, b) { return a.reputRule1 > b.reputRule1; });
	}

	createRep1Entrys(moduleName, entrys) {
		let totalPoints = this._format.getTotalCountEntry(entrys, moduleName);
		let nbTags = entrys.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		for (let i = entrys.length - 1; i >= 0; i--) {
			for (var index = 0; index < entrys[i].modulesReputation.length; index++) {
				var element =  entrys[i].modulesReputation[index];
				if (moduleName.trim() == element.id.id.trim()) {
					element.repRule1 = this._format.getReput(element.count, divisions) * AppSettings.COEFRULES[0]
				}
			}
		}
	}
/*
	createRep1WordSearch(moduleName, wordSearch) {
		let totalPoints = this._format.getTotalCountEntry(entrys, moduleName);
		let nbTags = entrys.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		for (var index = 0; index < entrys[i].modulesReputation.length; index++) {
			var element =  entrys[i].modulesReputation[index];
			if (moduleName.trim() == element.id.id.trim()) {
				element.repRule1 = this._format.getReput(element.count, divisions) * AppSettings.COEFRULES[0]
			}
		}
	}*/

	createRep2(moduleName, listUsers, entries) {
		for (var index = 0; index < entries.length; index++) {
			for (var i = 0; i < entries[index].modulesReputation.length; i++) {
				var el = entries[index].modulesReputation[i];
				if (el.id.id.trim() == moduleName) {
					this._httpservice.getUserReputation(listUsers[entries[index].author.name])
						.subscribe(
							data => {
								console.log(data);
							}
						) 
				}
			}
			
		}
	}

	createRep3(moduleName, entries) {
		let totalPoints = this._format.getTotalSearchClick(entries, moduleName);
		let nbTags = entries.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		for (let i = entries.length - 1; i >= 0; i--) {
			for (var index = 0; index < entries[i].modulesReputation.length; index++) {
				var element =  entries[i].modulesReputation[index];
				if (moduleName.trim() == element.id.id.trim()) {
					element.repRule3 = this._format.getReput(element.count, divisions) * AppSettings.COEFRULES[2]
				}
			}
		}
	}

	numberUpdates() { }

	timestampInsertion(nbDays) {
		var idRule = 5
		while(nbDays < AppSettings.TIMESTAMPRULE[idRule][0]) {
			idRule--;
		}
		return {nbDays : nbDays, reputation : (AppSettings.TIMESTAMPRULE[idRule][1] * AppSettings.COEFRULES[4])}
	}

	getTimestamp(timestamp, today, context) {
		var start = moment(timestamp)
		var end = today
		var nbDays = end.diff(start, 'days') // Get number of days
		 // rule 5 (Date Insertion)
		return this.timestampInsertion(nbDays);
	}

	countTotalReputation(context) {
		for (var index = 0; index < context.length; index++) {
			context[index].totalReput = (context[index].repRule1 +  
				context[index].repRule2 + context[index].repRule3 
				+ context[index].repRule4 + context[index].repRule5)
		}
	}
	countTotalReputationForModule(entries) {
		for (var index = 0; index < entries.length; index++) {
			var el = entries[index].modulesReputation
			for (var i = 0; i < el.length;i++) {
				el[i].totalReput = (el[i].repRule1 +  
					el[i].repRule2 + el[i].repRule3 
					+ el[i].repRule4 + el[i].repRule5)
			}
			
		}
	}

	constructReputationForModule(element, modules) {
		for (var index = 0; index < modules.length; index++) {
			var module = modules[index];
			if (module.trim() != "") {
				if (this.modulesOfWord[module.trim()] != undefined) {
					var object = {id : this.modulesOfWord[module.trim()], repRule1 : 0,repRule2 : 0,repRule3 : 0,repRule4 : 0,repRule5 : 0,totalReput : 0, count: 0}
					object.count = isNaN(this._format.countSameWord(element.name, this.modulesOfWord[module.trim()].goals.split(' '))) ? 0 :this._format.countSameWord(element.name, this.modulesOfWord[module.trim()].goals.split(' ')) 
					element.count += object.count
					element.modulesReputation.push(object);
				}
			}
			
		}
	}

	getReputationTotal(el) {
		let count = 0
		for (var index = 0; index < el.modulesReputation.length; index++) {
			var element = el.modulesReputation[index];
			count += element.count;
		}
		return count;
	}

	createContext(wordSearch) {
		let today = moment()
		let instance = this;

		var allEntries : Array<Entry>= []
		
		for (let prop in this.modulesOfWord) {
			var module = this.modulesOfWord[prop];
			allEntries = allEntries.concat(module.allterms)
		}
		allEntries = this._format.uniqueEntries(allEntries, 'name')		
		
		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			element.modules.id = element.modules.id.replace(/\.0/g, " ")
			var mod = element.modules.id.replace(/\,/g, " ").replace(/\-/g, " ")
			var modu = mod.split(' ')
			this.constructReputationForModule(element, modu)
		}

		allEntries = this.sortTags(allEntries)

		this.constructReputationForModule(wordSearch, wordSearch.modules.id)

		allEntries.push(wordSearch)

		for (let prop in this.modulesOfWord) {
			var el = this.modulesOfWord[prop];
			this.createRep1Entrys(el.id, allEntries)
			//this.createRep2(el.id, allEntries)
			/*instance._httpservice.getUsers()
			.subscribe(
				data => {
					this.createRep2(el.id, data.user_list.list, allEntries)
				},
				error => {}
			)*/
			this.createRep3(el.id, allEntries)
		}
		this.countTotalReputationForModule(allEntries)
		var wordSelected
		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			if (element.name == wordSearch.name) {
				wordSelected = element
				allEntries.slice(index, 1)
			}
		}
		instance.wordSearch = Object.assign({}, wordSelected)
		instance.wordSel = Object.assign({}, instance.wordSearch);

		var totalPoints = instance.getReputationTotal(instance.wordSearch)
		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			var points =  instance.getReputationTotal(element)
			if (points > totalPoints) {totalPoints = points}
		}

		this.totalPoints = totalPoints

		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			for (var i = 0; i < element.modulesReputation.length; i++) {
				var ele = element.modulesReputation[i];
				var half = Math.floor(((ele.totalReput * 10) / this.totalPoints))
				ele.color = half >= 7 ? "#16ab39" :  half > 4 ? "#eaae00" : "#db2828"
				ele.animationLeft = "loading-" + (half >= 5 ? (half - 5)*2: 0)  +" 0.5s linear forwards"
				ele.animationRight = "loading-" + (half >= 5 ? 10 : half * 2) + " 0.5s linear forwards"
			}
			
		}
		for (var cpt = 0; cpt < allEntries.length; cpt++) {
			if (allEntries[cpt].name == wordSearch.name) {
				allEntries.splice(cpt, 1)
			}
		}

		instance._manager3d.createScene(wordSearch, allEntries, instance.wordSel, instance.modulesOfWord);
		instance._manager3d.runRender();
		this.loading = false;
		/*
		
		this.context = this.sanitizeMeaningForZone();
		this.context = Array.from(new Set(this.context))
		for (var index = 0; index < this.context.length; index++) {
			var el = new Entry();
			el.name = this.context[index]
			this.contextEntrys.push(el)
		}
		let explaination = this._format.splitter(wordSearch.meaning, [' '])// remove espaces
		this.numberTimesApparitions(explaination, this.contextEntrys)
		console.log(this.contextEntrys)
		this.sortTags(this.contextEntrys) // Sort the best tags 'importance by nb of apparition in the meaning of the word searched'
		
		for (let index = 0; index < this.contextEntrys.length; index++) {
			let element = this.contextEntrys[index];
			
			//element.name = element.name[element.name.length-1] != '.' ? element.name : element.name.substring(0,element.name.length-1)
			element.totalReput = 0;
			element.repRule1 = 0;
			element.repRule2 = 0;
			element.repRule3 = 0;
			element.repRule4 = 0;
			element.repRule5 = 0;
			this._httpservice.getInfosOnWiki(element.name).subscribe(function (res) {
				element.meaning = res[2][0]
				element.source = "Wikipédia"
			})
			this._httpservice.getRevisionsOnWiki(element.name).subscribe(function (response) {
				let results = response.query.pages
				let id = Object.keys(response.query.pages)
				let obj = {nbDays : 0, reputation : 0}
				if (id[0] != '-1') {
					obj = instance.getTimestamp(results[id[0]].revisions[0].timestamp, today, instance.contextEntrys)
				}
				element.repRule5 = obj.reputation
				element.lastUpdatedNbDays = obj.nbDays
				if (index == instance.contextEntrys.length - 1) {
					/*
					for (var cpt = instance.contextEntrys.length - 1; cpt >= 0 ; cpt--) {
						if (instance.contextEntrys[cpt].meaning == "" || instance.contextEntrys[cpt].meaning == undefined && instance.contextEntrys.length > 5) {instance.contextEntrys.splice(cpt, 1)}
					}*/
		/*			console.log(instance.contextEntrys)
					instance.createRep1(wordSearch, instance.contextEntrys) // rule 1 (Interne)
					instance.createRep2(wordSearch, instance.contextEntrys) // rule 3 (Recherche/Clique)
					//instance.numberUpdates(); // rule 4 (Mise à jour)
					
					instance.countTotalReputation(instance.contextEntrys)
					instance.wordSel = Object.assign({}, instance.wordSearch);
					//console.log(instance.context)
					if (wordSearch.name.includes(" ")) { }

					instance._manager3d.createScene(wordSearch, instance.contextEntrys, instance.wordSel, instance.modulesOfWord);
					instance._manager3d.runRender();
				}
			})
		
		}
		*/
	}


}