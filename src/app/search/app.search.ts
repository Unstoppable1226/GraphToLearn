import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { Manager3D } from '../3D/app.components3d'
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
	public wordSearch = { name: "", definition: "", explications: "", date: "", author: {}, searchClick: 0 , totalReput : 0};
	public dictionary = [];
	public context
	public collapsedMeaning = false
	public collapsedInfos = false
	public collapsedComments = true
	public collapsedActions = true
	private user: User
	public wordSel = { name: "", definition: "", explications: "", date: "", author: {}, searchClick: 0, totalReput : 0};

	constructor(private _route: ActivatedRoute, private _httpservice: HttpAPIService, private _format: Formatter, private _manager3d: Manager3D, private _userservice: UserService) {
		let instance = this;
		instance.user = instance._userservice.getCurrentUser();
		instance._route.params.subscribe(routeParams => {
			instance.id = routeParams.id;
			if (instance.id != undefined) {
				_httpservice.getEntryJSON(AppSettings.API_WORDS)
					.subscribe(function (response) {
						instance.initializeWordSearch(instance, response)
					})
			}
		})
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
						instance.wordSearch = JSON.parse(obj[prop].value);
						instance.wordSearch.searchClick = nbSearch += 1
						instance.wordSearch.date = instance._format.getDate(obj[prop].date);
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
		let text = this.wordSearch.explications;
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
		for (var i = this.context.length - 1; i >= 0; i--) {
			name = this.context[i]
			count = this._format.countSameWord(name, explaination);
			this.context[i] = { 'name': name, 'count': count }
		}

	}

	sortTags() {
		this.context.sort(function (a, b) { return a.count > b.count; }); // Sort
		if (this.context.length > 15) {
			let length = this.context.length
			this.context = this.context.slice(length - 15, length); // Take the 15 lasts 
		}
	}

	createRep1(wordSearch) {
		let totalPoints = this._format.getTotalCountWord(this.context);
		let nbTags = this.context.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		for (let i = this.context.length - 1; i >= 0; i--) {
			this.context[i].repRule1 = this._format.getReput(this.context[i].count, divisions) * AppSettings.COEFRULES[0]
		}
		this.context.sort(function (a, b) { return a.reputRule1 > b.reputRule1; });
	}

	createRep2(wordSearch) {}

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
			context[index].totalReput = (context[index].repRule1 +  context[index].repRule2 + context[index].repRule3 + context[index].repRule4)
			context[index].totalReput += context[index].repRule5.reputation;
		}
	}

	createContext(wordSearch) {
		let today = moment()
		let instance = this;
		this.context = this.sanitizeMeaningForZone();
		this.context = Array.from(new Set(this.context))
		let explaination = this._format.splitter(wordSearch.explications, [' '])// remove espaces
		this.numberTimesApparitions(explaination); // Sort the best tags 'importance by nb of apparition in the meaning of the word searched'
		this.sortTags()
		
		for (let index = 0; index < this.context.length; index++) {
			let element = this.context[index];
			
			//element.name = element.name[element.name.length-1] != '.' ? element.name : element.name.substring(0,element.name.length-1)
			element.totalReput = 0;
			element.repRule1 = 0;
			element.repRule2 = 0;
			element.repRule3 = 0;
			element.repRule4 = 0;
			element.repRule5 = {nbDays : null, reputation : 0};
			this._httpservice.getInfosOnWiki(element.name).subscribe(function (res) {
				element.meaning = res[2][0]
				element.source = "Wikipédia"
			})
			this._httpservice.getRevisionsOnWiki(element.name).subscribe(function (response) {
				let results = response.query.pages
				let id = Object.keys(response.query.pages)
				element.repRule5 = id[0] == '-1' ? {nbDays : null, reputation : 0} : instance.getTimestamp(results[id[0]].revisions[0].timestamp, today, instance.context)
				if (index == instance.context.length - 1) {
					instance.createRep1(wordSearch) // rule 1 (Interne)
					instance.createRep2(wordSearch) // rule 3 (Recherche/Clique)
					instance.numberUpdates(); // rule 4 (Mise à jour)
					
					instance.countTotalReputation(instance.context)
					instance.wordSel = Object.assign({}, instance.wordSearch);
					if (wordSearch.name.includes(" ")) { }
					instance._manager3d.createScene(wordSearch, instance.context, instance.wordSel);
					instance._manager3d.runRender();
				}
			})
			
		}

	}


}