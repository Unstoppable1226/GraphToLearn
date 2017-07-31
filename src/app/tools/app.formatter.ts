import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { AppSettings } from '../settings/app.settings';

import 'rxjs/add/operator/map';

@Injectable()
export class Formatter {
	constructor () {}

	splitter(stringToSplit, arraySeps) {
		let tags = stringToSplit;
		for (var i = arraySeps.length - 1; i >= 0; i--) {
			tags = tags.toString().split(arraySeps[i]);
		}
		for (var i = tags.length - 1; i >= 0; i--) {
			if ((tags[i] == "")) {tags.splice(i, 1);} // Remove no data in the table of words
		}
		return tags;
	}

	randomIntFromInterval(min,max){
    		return Math.floor(Math.random()*(max-min+1)+min);
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

	countSameWord(word, array) {
		let count = 0
		for (let i = array.length - 1; i >= 0; i--) {
			count += (array[i].toLowerCase().includes(word.toLowerCase()) ? 1 : 0)
		}
		return count
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
					word += def[i] + (length == length -1 ? '' : ' ')
				}
				return word;
			}
		}
		return "";
	}
}
