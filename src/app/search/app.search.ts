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

	constructor(private _route: ActivatedRoute, private _httpservice: HttpAPIService, private _format: Formatter, private _manager3d: Manager3D, private _userservice: UserService) {
		let instance = this;
		instance.user = instance._userservice.getCurrentUser();
		instance._route.params.subscribe(routeParams => {
			instance.id = routeParams.id;
			instance.id = instance.id.replace(AppSettings.FORWARD_SLACH, "/");
			instance.id = instance.id.replace(AppSettings.OPEN_PARENTHESIS, "(");
			instance.id = instance.id.replace(AppSettings.CLOSE_PARENTHESIS, ")");
			if (instance.id != undefined) {
				_httpservice.getEntryJSON(AppSettings.API_WORDS)
					.subscribe(function (response) {
						instance.initializeWordSearch(instance, response)
					})
			}
		})
	}

	like() { this.likeDislike(AppSettings.API_METALIKE, this.likes, this.canLike, 0, this.wordSearch.like) }

	dislike() { this.likeDislike(AppSettings.API_METADISLIKE, this.dislikes, this.canDislike, 1, this.wordSearch.dislike) }

	likeDislike(metadata, variable, can, nb, objectIncDec) {
		let instance = this;
		if (can) {
			if (nb == 0) {
				instance.likes.push(instance._userservice.getCurrentUser().mail)
			} else {
				instance.dislikes.push(instance._userservice.getCurrentUser().mail)
			}
			instance._httpservice.postEntryMetadata(metadata, JSON.stringify(nb == 0 ? instance.likes : instance.dislikes), instance.hashWordSel)
			.subscribe(function(res) {
				console.log(res)
				if (nb == 0) {
					instance.wordSearch.like.number += 1
					instance.canLike = false
				} else {
					instance.wordSearch.dislike.number += 1
					instance.canDislike = false
				}
			})
		} else {
			if (nb == 0) {
				instance.likes.splice(instance.likes.indexOf(instance._userservice.getCurrentUser().mail), 1)
			} else {
				instance.dislikes.splice(instance.dislikes.indexOf(instance._userservice.getCurrentUser().mail), 1)
			}
			instance._httpservice.postEntryMetadata(metadata, JSON.stringify(nb == 0 ? instance.likes : instance.dislikes), instance.hashWordSel)
			.subscribe(function(res) {
				console.log(res)
				if (nb == 0) {
					instance.wordSearch.like.number -= 1
					instance.canLike = true
				} else {
					instance.wordSearch.dislike.number -= 1
					instance.canDislike = true
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

	initializeWordSearch(instance, response) {
		let obj = response.dictionary.entries;
		for (let prop in obj) {
			let tag = obj[prop].tags;
			instance.dictionary.push(obj[prop]);
			if (tag.toLowerCase().includes(instance.id.toLowerCase())) {
				/* Il faudrait mettre à jour un compteur pour la recherche */
				let nbSearch: number = Number(obj[prop].conf.searchClick)
				nbSearch += 1
				instance._httpservice.postEntryMetadata(AppSettings.API_METASEARCHCLICK, nbSearch, prop) // Put searchClick to 0
					.subscribe(function (resp) {
						instance.hashWordSel = prop;
						instance.canLike = instance.constructLikeDislike(obj[prop].conf.like, 0 ,instance.canLike)
						instance.canDislike = instance.constructLikeDislike(obj[prop].conf.dislike, 1, instance.canDislike)
						instance.wordSearch.setData(JSON.parse(obj[prop].value));
						instance.wordSearch.searchClick = nbSearch
						instance.wordSearch.timestampCreation = instance._format.getDate(obj[prop].date);
						instance.wordSearch.author = { name: obj[prop].author, search: "" };
						instance.createContext(instance.wordSearch);
					});
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

	numberTimesApparitions(explaination) {
		let name
		let count
		for (var i = this.contextEntrys.length - 1; i >= 0; i--) {
			count = this._format.countSameWord(this.contextEntrys[i].name, explaination);
			this.contextEntrys[i].count = count;
		}
	}

	sortTags() {
		this.contextEntrys.sort(function (a: Entry, b : Entry) { return a.count - b.count; }); // Sort
		if (this.contextEntrys.length > 15) {
			let length = this.contextEntrys.length
			this.contextEntrys = this.contextEntrys.slice(length - 15, length); // Take the 15 lasts 
		}
	}

	createRep1(wordSearch, context) {
		let totalPoints = this._format.getTotalCountWord(context);
		let nbTags = context.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		for (let i = context.length - 1; i >= 0; i--) {
			context[i].repRule1 = this._format.getReput(context[i].count, divisions) * AppSettings.COEFRULES[0]
		}
		context.sort(function (a, b) { return a.reputRule1 > b.reputRule1; });
	}

	createRep2(wordSearch, context) {}

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

	createContext(wordSearch) {
		let today = moment()
		let instance = this;
		this.context = this.sanitizeMeaningForZone();
		this.context = Array.from(new Set(this.context))

		for (var index = 0; index < this.context.length; index++) {
			var el = new Entry();
			el.name = this.context[index]
			this.contextEntrys.push(el)
		}
		let explaination = this._format.splitter(wordSearch.meaning, [' '])// remove espaces
		this.numberTimesApparitions(explaination)
		this.sortTags() // Sort the best tags 'importance by nb of apparition in the meaning of the word searched'
		
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
					console.log(instance.contextEntrys)
					/*
					for (var cpt = instance.contextEntrys.length - 1; cpt >= 0 ; cpt--) {
						if (instance.contextEntrys[cpt].meaning == "" || instance.contextEntrys[cpt].meaning == undefined && instance.contextEntrys.length > 5) {instance.contextEntrys.splice(cpt, 1)}
					}*/
					console.log(instance.contextEntrys)
					instance.createRep1(wordSearch, instance.contextEntrys) // rule 1 (Interne)
					instance.createRep2(wordSearch, instance.contextEntrys) // rule 3 (Recherche/Clique)
					//instance.numberUpdates(); // rule 4 (Mise à jour)
					
					instance.countTotalReputation(instance.contextEntrys)
					instance.wordSel = Object.assign({}, instance.wordSearch);
					//console.log(instance.context)
					if (wordSearch.name.includes(" ")) { }
					instance._manager3d.createScene(wordSearch, instance.contextEntrys, instance.wordSel);
					instance._manager3d.runRender();
				}
			})
			
		}

	}


}