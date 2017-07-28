import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';

@Component({
	selector: 'app-search',
	templateUrl: './app.search.html',
	styleUrls: ['./app.search.css'],
})

export class AppSearch{

	public id = "";
	public wordSearch = {name:"", definition : "", explications: ""};
	public dictionary = [];
	public context

	constructor(private _route : ActivatedRoute, private _httpservice : HttpAPIService,  private _format : Formatter) {
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
							instance.dictionary.push(obj[prop]);
							if (tag.toLowerCase().includes(instance.id.toLowerCase())) {
								instance.wordSearch = JSON.parse(obj[prop].value);
							}
						}
						instance.createContext();
					}
			  	)
		  	}
		})
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

	sanitizeMeaningForZone() {
		let text = this.wordSearch.explications;
		let table = AppSettings.articles.concat(AppSettings.connectors);
		let regex = new RegExp(this.wordSearch.definition, 'gmi');
		text = text.replace(regex, "");
		for (var i = table.length - 1; i >= 0; i--) {
			regex = new RegExp( " "+table[i]+ " ", 'gmi'); // we delete all the worlds that are not important
			text = text.replace(regex, " ");
		}
		text = text.replace(/Le |La |Les |\(les |Si | l'| d'| qu'|\" | \"/g, " ");
		text = text.replace(/ \(|\)./g," ");
		text = text.replace(/l\'/gi, "");
		let tags =  this._format.splitter(text, [',', ' ', '. ', ':', ' - ', ';', '\n']);
		tags = this.verbSelection(tags);
		return tags;
	}

	numberTimesApparitions(explaination) {
		let name
		let count
		for (var i = this.context.length - 1; i >= 0; i--) {
			name = this.context[i]
			count = this._format.countSameWord(name, explaination);
			this.context[i] = {'name' : name, 'count' : count}
		}
		
	}

	sortTags() {
		this.context.sort(function(a, b){return a.count > b.count;}); // Sort
		if (this.context.length > 15) {
			let length = this.context.length
			this.context = this.context.slice(length-15, length); // Take the 15 lasts 
		}
	}

	getReputRule1(tag, divisions) {
		for (let i = 0, rep = 1; i < divisions.length - 1; i++, rep++) {
			if (tag.count <= divisions[i]) {
				return rep;
			}
		}
	}

	getDivisions(totalPoints, nbTags) {
		let stepBy = Math.trunc(totalPoints / nbTags);
		let max = stepBy * nbTags, divisions = []
		for (let i = 1; i <= nbTags; i++) {
			divisions.push((i != nbTags) ? i * stepBy : max + (totalPoints - max)) 
		}
		return divisions
	}

	countExplaination() {
		let totalPoints = this._format.getTotalCountWord(this.context);
		let nbTags = this.context.length;
		let divisions = this.getDivisions(totalPoints, nbTags);
		for (let i = this.context.length - 1; i >= 0; i--) {
			this.context[i].repRule1 = this.getReputRule1(this.context[i], divisions)
		}
		this.context.sort(function(a, b){return a.reputRule1 > b.reputRule1;});
	}

	numberUpdates() {}

	timestampInsertion() {}

	createContext() {
		this.context = this.sanitizeMeaningForZone();
		this.context = Array.from(new Set(this.context))
		let explaination =  this._format.splitter(this.wordSearch.explications, [' '])// remove espaces
		this.numberTimesApparitions(explaination); // Sort the best tags 'importance by nb of apparition in the meaning of the word searched'
		this.sortTags()
		this.countExplaination() // rule 1 (Interne)
		//this.reputationP(); // rule 2 (Reputation P)
		//this.searchClicks() // rule 3 (Recherche/Clique)
		this.numberUpdates(); // rule 4 (Mise à jour)
		this.timestampInsertion(); // rule 5 (Date Insertion)
		if (this.wordSearch.name.includes(" ")) {}
	}


}