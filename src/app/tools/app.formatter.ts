import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { AppSettings } from '../settings/app.settings';

import 'rxjs/add/operator/map';

declare var $: any;

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
					count = count + element.count
				}
			}
		}
		return count
	}

	getTotalSearchClick(entries, nameModule) {
		let count: number = 0
		for (let i = entries.length - 1; i >= 0; i--) {
			for (var index = 0; index < entries[i].modulesReputation.length; index++) {
				var element = entries[i].modulesReputation[index];
				if (nameModule.trim() == element.id.id.trim()) {
					count = count + Number(entries[i].searchClick)
				}
			}
		}
		return count
	}

	getOneStringFromArrayString(tab) {
		let string = "";
		for (var index = 0; index < tab.length; index++) {
			var element = tab[index];
			string = string + element + (index == tab.length - 1 ? "" : ", ")
		}
		return string;
	}

	getTotalLikes(entries, nameModule) {
		let count: number = 0
		for (let i = entries.length - 1; i >= 0; i--) {
			for (var index = 0; index < entries[i].modulesReputation.length; index++) {
				var element = entries[i].modulesReputation[index];
				if (nameModule.trim() == element.id.id.trim()) {
					count = count + Number(entries[i].like.number)
				}
			}
		}
		return count
	}

	getReput(tag, divisions) {
		for (let i = 0, rep = 1; i <= divisions.length; i++ , rep++) {
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
		return a.filter(function (item, pos, array) {
			return array.map(function (mapItem) { return mapItem[param]; }).indexOf(item[param]) === pos;
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
					word = word + def[i] + (length == length - 1 ? '' : ' ')
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


	formatDate(string) {
		let year = string.substring(0, 4)
		let month = string.substring(4, 6)
		let day = string.substring(6, 8)
		let hours = string.substring(8, 10)
		let minutes = string.substring(10, 12)
		return new Date(year, month - 1, day, hours, minutes)
	}

	deleteAllModals() {
		// Remove other modals
		$('.ui.dimmer.modals.page.transition.hidden').children().remove()
	}

	validateEmail(email) {
		let re = /^(?:[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+\.)*[\w\!\#\$\%\&\'\*\+\-\/\=\?\^\`\{\|\}\~]+@(?:(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!\.)){0,61}[a-zA-Z0-9]?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9\-](?!$)){0,61}[a-zA-Z0-9]?)|(?:\[(?:(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}(?:[01]?\d{1,2}|2[0-4]\d|25[0-5])\]))$/;
		return re.test(email);
	}

	getTodayTimestamp() {
		let today = new Date();
		return today.getDate() + "/" + (Number(today.getMonth()) + 1) + "/" + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes();
	}

	formatTimestampToDate(timestamp) {
		let dateArray = timestamp.split(/ |\/|:/)
		return new Date(dateArray[2], dateArray[1] - 1, dateArray[0], dateArray[3], dateArray[4])
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

	
	escape(s) {
		var n = s;
		n = n.replace(/&/g, "&amp;");
		n = n.replace(/</g, "&lt;");
		n = n.replace(/>/g, "&gt;");
		n = n.replace(/"/g, "&quot;");

		return n;
	}

	diffString(o, n) {
		o = o.replace(/\s+$/, '');
		n = n.replace(/\s+$/, '');

		var out = this.diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));
		var str = "";

		var oSpace = o.match(/\s+/g);
		if (oSpace == null) {
			oSpace = ["\n"];
		} else {
			oSpace.push("\n");
		}
		var nSpace = n.match(/\s+/g);
		if (nSpace == null) {
			nSpace = ["\n"];
		} else {
			nSpace.push("\n");
		}

		if (out.n.length == 0) {
			for (var i = 0; i < out.o.length; i++) {
				str += '<del style="color:red">' + this.escape(out.o[i]) + oSpace[i] + "</del>";
			}
		} else {
			if (out.n[0].text == null) {
				for (n = 0; n < out.o.length && out.o[n].text == null; n++) {
					str += '<del style="color:red">' + this.escape(out.o[n]) + oSpace[n] + "</del>";
				}
			}

			for (var i = 0; i < out.n.length; i++) {
				if (out.n[i].text == null) {
					str += '<ins style="color:green">' + this.escape(out.n[i]) + nSpace[i] + "</ins>";
				} else {
					var pre = "";

					for (n = out.n[i].row + 1; n < out.o.length && out.o[n].text == null; n++) {
						pre += '<del style="color:red">' + this.escape(out.o[n]) + oSpace[n] + "</del>";
					}
					str += " " + out.n[i].text + nSpace[i] + pre;
				}
			}
		}

		return str;
	}

	randomColor() {	
		return "rgb(" + (Math.random() * 100) + "%, " +
		(Math.random() * 100) + "%, " +
		(Math.random() * 100) + "%)";
	}

	diffString2(o, n) {
		o = o.replace(/\s+$/, '');
		n = n.replace(/\s+$/, '');

		var out = this.diff(o == "" ? [] : o.split(/\s+/), n == "" ? [] : n.split(/\s+/));

		var oSpace = o.match(/\s+/g);
		if (oSpace == null) {
			oSpace = ["\n"];
		} else {
			oSpace.push("\n");
		}
		var nSpace = n.match(/\s+/g);
		if (nSpace == null) {
			nSpace = ["\n"];
		} else {
			nSpace.push("\n");
		}

		var os = "";
		var colors = new Array();
		for (var i = 0; i < out.o.length; i++) {
			colors[i] = this.randomColor();

			if (out.o[i].text != null) {
				os += '<span style="background-color: ' + colors[i] + '">' +
					this.escape(out.o[i].text) + oSpace[i] + "</span>";
			} else {
				os += "<del>" + this.escape(out.o[i]) + oSpace[i] + "</del>";
			}
		}

		var ns = "";
		for (var i = 0; i < out.n.length; i++) {
			if (out.n[i].text != null) {
				ns += '<span style="background-color: ' + colors[out.n[i].row] + '">' +
					this.escape(out.n[i].text) + nSpace[i] + "</span>";
			} else {
				ns += "<ins>" + this.escape(out.n[i]) + nSpace[i] + "</ins>";
			}
		}

		return { o: os, n: ns };
	}

	diff(o, n) {
		var ns = new Object();
		var os = new Object();

		for (var i = 0; i < n.length; i++) {
			if (ns[n[i]] == null)
				ns[n[i]] = { rows: new Array(), o: null };
			ns[n[i]].rows.push(i);
		}

		for (var i = 0; i < o.length; i++) {
			if (os[o[i]] == null)
				os[o[i]] = { rows: new Array(), n: null };
			os[o[i]].rows.push(i);
		}

		for (var s in ns) {
			if (ns[s].rows.length == 1 && typeof (os[s]) != "undefined" && os[s].rows.length == 1) {
				n[ns[s].rows[0]] = { text: n[ns[s].rows[0]], row: os[s].rows[0] };
				o[os[s].rows[0]] = { text: o[os[s].rows[0]], row: ns[s].rows[0] };
			}
		}

		for (var i = 0; i < n.length - 1; i++) {
			if (n[i].text != null && n[i + 1].text == null && n[i].row + 1 < o.length && o[n[i].row + 1].text == null &&
				n[i + 1] == o[n[i].row + 1]) {
				n[i + 1] = { text: n[i + 1], row: n[i].row + 1 };
				o[n[i].row + 1] = { text: o[n[i].row + 1], row: i + 1 };
			}
		}

		for (var i = n.length - 1; i > 0; i--) {
			if (n[i].text != null && n[i - 1].text == null && n[i].row > 0 && o[n[i].row - 1].text == null &&
				n[i - 1] == o[n[i].row - 1]) {
				n[i - 1] = { text: n[i - 1], row: n[i].row - 1 };
				o[n[i].row - 1] = { text: o[n[i].row - 1], row: i - 1 };
			}
		}

		return { o: o, n: n };
	}
}
