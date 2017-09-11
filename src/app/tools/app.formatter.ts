import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { AppSettings } from '../settings/app.settings';

import 'rxjs/add/operator/map';

@Injectable()
export class Formatter {
	constructor() { }

	splitter(stringToSplit, arraySeps) {
		let tags = stringToSplit;
		for (var i = arraySeps.length - 1; i >= 0; i--) {
			tags = tags.toString().split(arraySeps[i]);
		}
		for (var i = tags.length - 1; i >= 0; i--) {
			if ((tags[i] == "")) { tags.splice(i, 1); } // Remove no data in the table of words
		}
		return tags;
	}

	randomIntFromInterval(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}


	capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	getTotalCountWord(array) {
		let count = 0
		for (let i = array.length - 1; i >= 0; i--) {
			count += array[i].count
		}
		return count
	}

	getTotalCountEntry(entrys, nameModule) {
		let count = 0
		for (let i = entrys.length - 1; i >= 0; i--) {
			for (var index = 0; index < entrys[i].modulesReputation.length; index++) {
				var element = entrys[i].modulesReputation[index];
				if (nameModule.trim() == element.id.id.trim()) {
					count += element.count
				}
			}	
		}
		return count
	}

	getTotalSearchClick(entries, nameModule) {
		let count = 0
		for (let i = entries.length - 1; i >= 0; i--) {
			for (var index = 0; index < entries[i].modulesReputation.length; index++) {
				var element = entries[i].modulesReputation[index];
				if (nameModule.trim() == element.id.id.trim()) {
					count += entries[i].searchClick
				}
			}	
		}
		return count
	}

	getReput(tag, divisions) {
		for (let i = 0, rep = 1; i < divisions.length - 1; i++ , rep++) {
			if (tag <= divisions[i]) {
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

	countSameWord(word, array) {
		let count = 0
		for (let i = array.length - 1; i >= 0; i--) {
			count += (array[i].trim().toLowerCase().includes(word.trim().toLowerCase()) ? 1 : 0)
		}
		return count
	}

	uniqueEntries(a, param) {
		return a.filter(function(item, pos, array){
            return array.map(function(mapItem){ return mapItem[param]; }).indexOf(item[param]) === pos;
        })
	}


	getDefinition(tag, dictionary) {
		let el
		let length = tag.length;
		let word = ""
		for (var i = dictionary.length - 1; i >= 0; i--) {
			el = JSON.parse(dictionary[i].value)
			if (el.name.toLowerCase() == tag.toLowerCase()) {
				let def = this.splitter(el.definition, [',', ' ', ':'])
				for (var i = 0; i <= length - 1; i++) {
					word += def[i] + (length == length - 1 ? '' : ' ')
				}
				return word;
			}
		}
		return "";
	}

	getDate(string) {
		let year = string.substring(0, 4)
		let month = string.substring(4, 6)
		let day = string.substring(6, 8)
		let hours = string.substring(8, 10)
		let minutes = string.substring(10, 12)
		return day + "/" + month + "/" + year + " " + hours + ":" + minutes
	}

	cleanArray(array) {
		var i, j, len = array.length, out = [], obj = {};
		for (i = 0; i < len; i++) {
			obj[array[i]] = 0;
		}
		for (j in obj) {
			out.push(j);
		}
		return out;
	}
}
