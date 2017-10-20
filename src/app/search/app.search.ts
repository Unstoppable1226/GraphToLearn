import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { AppComponent } from '../app.component';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { Manager3D } from '../3D/app.components3d'
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';
import { WordsService } from '../model/words-service';

import { Entry } from '../model/entry'
import { EntryCowaboo } from '../model/entrycowaboo'
import { Update } from '../model/update'
import { Comment } from '../model/comment'

import { User } from '../model/user'
import { Request } from '../model/request'
import { RequestType } from '../model/request-type'
import { UserService } from '../model/user-service'
import { HistorySearchService } from '../model/history-search'

import { Router } from '@angular/router';

declare var dat: any;
declare var $: any;
declare var moment: any;

@Component({
	selector: 'app-search',
	templateUrl: './app.search.html',
	styleUrls: ['./app.search.css'],
})

export class AppSearch implements OnInit {

	public id = "";
	public nbTimes = 0;
	public disabled = true;
	public loading = false
	public loadingLike = false;
	public loading2 = false
	public loadingModif = false
	public wordFind = true;
	public wordSearch: Entry = new Entry()// The that we have searched
	public wordSel: Entry = new Entry() // The word that is selected on the context

	public allEntries
	public allUsers = {}

	public hashWordSel: string = ""
	public canVote: true
	public dictionary = []
	public context
	public contextEntrys: Array<Entry> = []
	public collapsedMeaning = false
	public collapsedInfos = false
	public collapsedComments = true
	public collapsedActions = false
	public user: User
	private allModules = []
	private modulesOfWord = {}
	private totalPoints = 0
	public col1
	public col2
	public col3
	public col4

	public newModule = false;
	public nameTaken = false;
	public nameTakenModule = false;

	public nameChosen = false;
	public nameChosenModule = false;

	public loadingAddModule = false;
	public loadingAddComment = false;
	public newModuleObj: any = { id: "", name: "", goals: "" }
	public errorAddModule = false;
	public errorTextAddModule = "";
	public msgIdModuleTaken = "Ce N° est disponible"

	public msgNameTaken = "Ce nom est disponible";
	public styleModuleNew = AppSettings.WHITEMOREDARK;
	public styleModuleNewCol = AppSettings.BLACK;
	public styleModuleEx = AppSettings.GREY;
	public styleModuleExCol = AppSettings.WHITE;
	public data = {};
	public types = [];
	public modules: Array<any> = [];
	public valuesModules: Array<any> = []
	public contexts = [];
	public word: string = '';
	public newModules: string = '';
	public source: string = ""; // Separate with the comma
	public definition: string = "";
	public meaning: string = "";

	public newComment: string = "";

	public lastModifItem: EntryCowaboo
	public difName: boolean = false
	public difType: boolean = false
	public difMeaning: boolean = false
	public difDefinition: boolean = false
	public difSource: boolean = false
	public difContext: boolean = false
	public difKeywords: boolean = false
	public items = [];

	constructor(private _route: ActivatedRoute, private _wordsservice: WordsService, private _router: Router, private _alert: AlertsService, private _httpservice: HttpAPIService, private _format: Formatter, private _manager3d: Manager3D, private _userservice: UserService, public _historysearch: HistorySearchService) {
		this._format.deleteAllModals()
		this.disabled = true;
		this.user = new User()
		this.lastModifItem = new EntryCowaboo("", "", "", "", "", "", "", "", "", "", "", [], [], false, "", "")
		delete (this._manager3d)
		this._manager3d = new Manager3D(this._format, this._wordsservice, this._userservice)
	}

	initializeAll() {
		let instance = this;
		if (instance._wordsservice.modules == null) {
			instance._httpservice.getEntryJSON(AppSettings.API_MODULES)
				.subscribe(function (modules) {
					instance._wordsservice.modules = modules
					let obj = modules.dictionary.entries;
					for (let prop in obj) {
						instance.allModules.push(JSON.parse(obj[prop].value))
					}
				})
			this._wordsservice.getUsers()
		} else {
			let obj = instance._wordsservice.modules.dictionary.entries;
			for (let prop in obj) {
				instance.allModules.push(JSON.parse(obj[prop].value))
			}
		}

		instance.user = instance._userservice.currentUser
		instance._route.params.subscribe(routeParams => {
			instance.id = routeParams.id;
			instance.id = instance.id.replace(AppSettings.FORWARD_SLACH, "/");
			instance.id = instance.id.replace(AppSettings.OPEN_PARENTHESIS, "(");
			instance.id = instance.id.replace(AppSettings.CLOSE_PARENTHESIS, ")");
			if (instance.id != undefined) {
				if (instance._wordsservice.words == null) {
					instance._httpservice.getEntryJSON(AppSettings.API_WORDS)
						.subscribe(
						response => {
							instance._wordsservice.words = response
							instance.initializeWordSearch(instance, response)
						}
						)
				} else {
					instance.initializeWordSearch(instance, instance._wordsservice.words)
				}

			}
		})
	}

	onCreate() {
		let instance = this;
		if (this._userservice.currentUser == undefined) {
			this._userservice.getCurrentUser().then(
				(res: User) => {
					this._userservice.currentUser = res;
					this.user = this._userservice.currentUser
					this.initializeAll()
				}
			)
		} else {
			this.user = this._userservice.currentUser
			this.initializeAll()
		}
	}
	focusAddComment() {
		$('#commentsAndRevisions').removeClass('collapse')
		$('#newComment').focus()
		this.collapsedComments = false;
	}

	refresh() {
		this.id = "";
		this.nbTimes = 0;
		this.loading = false
		this.loading2 = false
		delete (this.wordSearch)
		delete (this.wordSel)
		this.wordSearch = new Entry()// The that we have searched
		this.wordSel = new Entry() // The word that is selected on the context
		this.hashWordSel = ""
		this.collapsedMeaning = false
		this.collapsedInfos = false
		this.collapsedComments = true
		this.collapsedActions = false;
		delete (this.modulesOfWord)
		this.modulesOfWord = {}
		this.totalPoints = 0
		this.col1 = this.user.settingsGeneral.colSearchTerm
		this.col2 = this.user.settingsGeneral.colKeyWords
		this.col3 = this.user.settingsGeneral.colModule
		this.col4 = this.user.settingsGeneral.colOtherTerms
		this.allModules.splice(0, this.allModules.length)
		this.dictionary.splice(0, this.dictionary.length)
		this.contextEntrys.splice(0, this.contextEntrys.length)
		this.allModules = []
		this.dictionary = []
		this.contextEntrys = []
	}

	backToHome() {
		this.refresh()
		this._router.navigate(['/home'])
	}

	like() { this.likeDislike(AppSettings.API_METALIKE, this.wordSel.likes, this.wordSel.canLike, 0, this.wordSel.like) }

	dislike() { this.likeDislike(AppSettings.API_METADISLIKE, this.wordSel.dislikes, this.wordSel.canDislike, 1, this.wordSel.dislike) }

	postLikeBalance(metadata, nb, hash, voted) {
		let instance = this;
		let hashWord = ""
		for (let prop in hash.dictionary.entries) {
			if (JSON.parse(hash.dictionary.entries[prop].value).name == this.wordSel.name) {
				hashWord = prop
				break;
			}
		}

		this._httpservice.postEntryMetadata(metadata, JSON.stringify(nb == 0 ? this.wordSel.likes : this.wordSel.dislikes), hashWord, this._userservice.currentUser.secretKey)
			.subscribe(
			res => {
				console.log(res)
				if (nb == 0) {
					this.wordSel.like.number += 1
					this.wordSel.canLike = false
					this.loadingLike = false
					if (voted) {
						this._httpservice.getUsers()
							.subscribe(
							data => {
								let amount: number = Number(this._userservice.currentUser.settingsReputation.repContribution) - (0.25 * this.wordSel.updates.length)
								this._httpservice.postBalance(this._userservice.currentUser.publicKey, this._userservice.currentUser.secretKey, data.user_list.list[this.wordSel.author.name], amount)
									.subscribe(function (balance) {
										if (balance && instance._userservice.currentUser.mail != instance.wordSel.author.name) { instance._userservice.currentUser.reputation -= amount }
									})
							},
							error => { }
							)
					}
				} else {
					this.wordSel.dislike.number += 1
					this.wordSel.canDislike = false
					this.loading2 = false
				}
			}
			)
	}

	likeDislike(metadata, variable, can, nb, objectIncDec) {

		let instance = this;
		if (nb == 0) {
			instance.loadingLike = true
		} else {
			instance.loading2 = true
		}
		if (can) {
			let voted = false
			if (nb == 0) {
				voted = true
				instance.wordSel.likes.push(instance._userservice.currentUser.mail)
			} else {
				instance.wordSel.dislikes.push(instance._userservice.currentUser.mail)
			}
			instance._httpservice.getEntryJSON(AppSettings.API_WORDS)
				.subscribe(
				data => this.postLikeBalance(metadata, nb, data, voted)
				)
		} else {
			if (nb == 0) {
				instance.wordSel.likes.splice(instance.wordSel.likes.indexOf(instance._userservice.currentUser.mail), 1)
			} else {
				instance.wordSel.dislikes.splice(instance.wordSel.dislikes.indexOf(instance._userservice.currentUser.mail), 1)
			}
			instance._httpservice.getEntryJSON(AppSettings.API_WORDS)
				.subscribe(
				data => {
					let hashWord = ""
					for (let prop in data.dictionary.entries) {
						if (JSON.parse(data.dictionary.entries[prop].value).name == this.wordSel.name) {
							hashWord = prop
							break;
						}
					}
					instance._httpservice.postEntryMetadata(metadata, JSON.stringify(nb == 0 ? instance.wordSel.likes : instance.wordSel.dislikes), hashWord, instance._userservice.currentUser.secretKey)
						.subscribe(function (res) {
							console.log(res)
							if (nb == 0) {
								instance.wordSel.like.number -= 1
								instance.wordSel.canLike = true
								instance.loadingLike = false
							} else {
								instance.wordSel.dislike.number -= 1
								instance.wordSel.canDislike = true
								instance.loading2 = false
							}
						})
				}
				)
		}
	}

	findUser(tabLikes) {
		let user = this._userservice.currentUser
		for (let i = 0; i < tabLikes.length; i++) {
			if (user.mail.toLowerCase() == tabLikes[i].toLowerCase()) {
				return true;
			}
		}
		return false
	}

	constructLikeDislike(tab, nb, term) {
		if (tab == undefined) {
			term.canLike = true;
			term.canDislike = true;
		} else {
			if (nb == 0) {
				try {
					term.likes = JSON.parse(tab)
				} catch (e) {
					term.likes = tab
				}
				term.canLike = !this.findUser(term.likes)
				term.like.number = term.likes.length;
			} else {
				try {
					term.dislikes = JSON.parse(tab)
				} catch (e) {
					term.dislikes = tab
				}
				term.canDislike = !this.findUser(term.dislikes)
				term.dislike.number = term.dislikes.length;
			}
		}
		return term
	}

	getSameModule(word) {
		var element;
		for (var index = 0; index < this.allModules.length; index++) {
			element = this.allModules[index];
			if (element.id == word) {
				element.reputation = Math.floor(Math.random() * 10) + 1
				element.color = element.reputation >= 7 ? "#16ab39" : element.reputation > 4 ? "#eaae00" : "#db2828"
				element.animationLeft = "loading-" + (element.reputation >= 5 ? (element.reputation - 5) * 2 : 0) + " 0.5s linear forwards"
				element.animationRight = "loading-" + (element.reputation >= 5 ? 10 : element.reputation * 2) + " 0.5s linear forwards"
				this.modulesOfWord[element.id] = element
			}
		}
	}

	getAllWordsOfModules(response) {
		let obj = response.dictionary.entries
		for (let prop in this.modulesOfWord) {
			this.modulesOfWord[prop].allterms = [];
		}

		for (let prop in obj) {
			let entry = JSON.parse(obj[prop].value)
			for (let props in this.modulesOfWord) {
				var element = this.modulesOfWord[props];
				if (entry.modules.includes(element.id.trim())) {
					let	objInsert = new Entry()
					objInsert.setData(JSON.parse(obj[prop].value), obj[prop]);
					objInsert.searchClick = obj[prop].conf[AppSettings.API_METASEARCHCLICK] == undefined || obj[prop].conf[AppSettings.API_METASEARCHCLICK] == 'NaN' ? 0 : obj[prop].conf[AppSettings.API_METASEARCHCLICK]
					objInsert = this.constructLikeDislike(obj[prop].conf.like, 0, objInsert)
					objInsert = this.constructLikeDislike(obj[prop].conf.dislike, 1, objInsert)
					//objInsert.timestamp = this._format.formatDate(obj[prop].date)
					objInsert.timestampCreation = this._format.getDate(obj[prop].date);
					objInsert.author = { name: obj[prop].author, reputation: 0 };
					this.allUsers[obj[prop].author] = { publicKey: this._wordsservice.users.user_list.list[obj[prop].author], reputation: 0 }
					element.allterms.push(objInsert)
				}
			}
		}
	}

	initializeWordSearch(instance, response) {
		let obj = response.dictionary.entries;
		instance.wordSel.name = instance.id
		let word, keys: string[] = Object.keys(obj), prop: string = ""
		for (let i: number = keys.length - 1; i >= 0; i--) {
			prop = keys[i];
			let tag = obj[prop].tags;
			word = JSON.parse(obj[prop].value)
			if ((tag.trim().toLowerCase() == "||" + instance.id.trim().toLowerCase() + "||") || (word.name.trim().toLowerCase() == instance.id.trim().toLowerCase())) {
				this.wordFind = true;

				/* Il faudrait mettre à jour un compteur pour la recherche */
				let nbSearch: number = Number(obj[prop].conf.searchClick)

				if (isNaN(nbSearch)) { nbSearch = 0 }
				nbSearch += 1
				instance._httpservice.postEntryMetadata(AppSettings.API_METASEARCHCLICK, nbSearch, prop, instance._userservice.currentUser.secretKey) // Put searchClick to 0
					.subscribe(function (resp) { console.log(resp) });

				instance.hashWordSel = prop;

				instance.wordSearch.setData(JSON.parse(obj[prop].value), obj[prop]);

				for (let i = 0; i < instance.wordSearch.modules.id.length; i++) {
					instance.getSameModule(instance.wordSearch.modules.id[i].trim())
				}

				instance.wordSearch.searchClick = nbSearch
				instance.wordSearch.timestamp = instance._format.formatDate(obj[prop].date);
				instance.wordSearch.timestampCreation = instance._format.getDate(obj[prop].date);


				instance.allUsers[obj[prop].author] = { publicKey: instance._wordsservice.users.user_list.list[obj[prop].author], reputation: 0 }

				var term = instance.constructLikeDislike(obj[prop].conf.like, 0, instance.wordSearch)
				instance.wordSearch = instance.constructLikeDislike(obj[prop].conf.dislike, 1, term)

				let canVote = !(instance.wordSearch.author.name == instance._userservice.currentUser.mail && instance._userservice.currentUser.reputation < instance._userservice.currentUser.settingsReputation.repIntegrationEditor)

				if (instance.wordSearch.canLike) {
					instance.wordSearch.canLike = canVote
				}
				if (instance.wordSearch.canDislike) {
					instance.wordSearch.canDislike = canVote
				}

				console.log(response)

				instance.getAllWordsOfModules(response)
				instance.createContext(instance.wordSearch);

				let tab: Array<string> = []

				instance._httpservice.getEntryJSON(AppSettings.API_HISTORY)
					.subscribe(
					data => {
						let listHistory = data.dictionary.conf[instance._userservice.currentUser.mail]
						console.log(listHistory)
						if (listHistory != undefined) {
							if (!listHistory.includes(instance.wordSearch.name)) {
								instance._historysearch.lastSearches = listHistory == "[]" ? [] : listHistory
								instance._historysearch.addSearch(instance.wordSearch.name)
							} else {
								instance._historysearch.lastSearches = listHistory
								instance._historysearch.existantSoUpdate(instance.wordSearch.name)
							}
						} else {
							instance._historysearch.lastSearches = []
							instance._historysearch.addSearch(instance.wordSearch.name)
						}
						instance._httpservice.postObservatoryMetadata(instance._userservice.currentUser.mail, JSON.stringify(instance._historysearch.getLastSearches()), AppSettings.API_HISTORY, instance._userservice.currentUser.secretKey)
							.subscribe(function (response) { console.log(response); })

					},
					error => { }
					)
				return;
			}
		}
		this.loading = false;
		this.wordFind = false;
	} // initializeWordSearch

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
	} // hideOrShow

	hideModals() { $('.ui.modal').modal('hide all') } // hideModals

	showModifications() {
		if (this.wordFind) {
			this.word = this.wordSel.name
			//this.newModules = '168';
			this.source = this.wordSel.source; // Separate with the comma
			this.definition = this.wordSel.definition;
			this.meaning = this.wordSel.meaning;
			this.items.splice(0, this.items.length)
			for (var index = 0; index < this.wordSel.keywords.length; index++) {
				this.items.push({ display: this.wordSel.keywords[index], value: this.wordSel.keywords[index] })
			}
			//this.items.push(this.wordSel.keywords
			$('.ui.modification.modal').modal('show')

			for (var index = 0; index < this.types.length; index++) {
				var element = this.types[index];
				element.name = element.value
				if (element.name == 'Aucun') {
					element.selected = this.wordSel.type.trim() == ""
				} else {
					element.selected = element.value == this.wordSel.type.trim()
				}

			}

			for (var index = 0; index < this.contexts.length; index++) {
				var element = this.contexts[index];
				element.name = element.value
				if (element.name == 'Aucun') {
					element.selected = this.wordSel.context.trim() == ""
				} else {
					element.selected = element.value == this.wordSel.context.trim()
				}
			}


			for (var index = 0; index < this.valuesModules.length; index++) {
				var ele = this.valuesModules[index];
				ele.name = ele.value
				ele.selected = this.wordSel.modules.id.indexOf(ele.value) != -1
			}

			$('#select-types').dropdown({ values: this.types })
			$('#select-context').dropdown({ values: this.contexts })

			$('.ui.dropdown.multiple').dropdown({ values: this.valuesModules })
		}
	}

	ngAfterViewInit() {
		this._manager3d.startEngine('renderCanvas');
		if (this.allEntries != undefined) {
			this._manager3d.createScene(this.wordSearch, this.allEntries, this.wordSel, this.modulesOfWord, this.user);
			this._manager3d.runRender();
		}

		$('#popupReputation').popup()
		$('#lastModif').popup()
		$('.ui.dropdown').dropdown();
		$('.ui.dropdown.multiple').dropdown({ allowAdditions: true, });
		$('.cusprogress-value').dimmer({
			on: 'hover'
		});
		this.isUnique(0, '#wordInfo', 'name');
	}

	showInfos(ev, index) {
		$('#proDefault' + index).fadeOut('fast', function () {
			$('#pro' + index).fadeIn('fast')
		})
	}

	showInfosLeave(ev, index) {
		ev.stopPropagation()
		setTimeout(() => {
			$('#pro' + index).fadeOut('fast', function () {
				$('#proDefault' + index).fadeIn('fast')
			})
		}, 300)
	}

	showLastModification() {
		let modif: any = this.wordSel.updates[this.wordSel.updates.length - 1]

		let lastModif = modif.version

		this.lastModifItem = lastModif
		let tags = "";

		for (let index = 0; index < this.wordSel.keywords.length; index++) {
			let element = this.wordSel.keywords[index];
			tags = tags + element + (index == this.wordSel.keywords.length - 1 ? "" : ", ")
		}

		this.difName = false
		this.difType = false
		this.difMeaning = false
		this.difDefinition = false
		this.difSource = false
		this.difContext = false
		this.difKeywords = false

		if (lastModif.name != this.wordSel.name) {
			this.difName = true
			document.getElementById('afterModifName').innerHTML = this._format.diffString(lastModif.name, this.wordSel.name)
		}
		if (lastModif.type != this.wordSel.type) {
			this.difType = true
			document.getElementById('afterModifType').innerHTML = this._format.diffString(lastModif.type, this.wordSel.type)
		}
		if (lastModif.meaning != this.wordSel.meaning) {
			this.difMeaning = true
			document.getElementById('afterModifMeaning').innerHTML = this._format.diffString(lastModif.meaning, this.wordSel.meaning)
		}
		if (lastModif.definition != this.wordSel.definition) {
			this.difDefinition = true
			document.getElementById('afterModifDefinition').innerHTML = this._format.diffString(lastModif.definition, this.wordSel.definition)
		}
		if (lastModif.source != this.wordSel.source) {
			this.difSource = true
			document.getElementById('afterModifSource').innerHTML = this._format.diffString(lastModif.source, this.wordSel.source)
		}
		if (lastModif.context != this.wordSel.context) {
			this.difContext = true
			document.getElementById('afterModifContext').innerHTML = this._format.diffString(lastModif.context, this.wordSel.context)
		}
		if (lastModif.keywords != tags) {
			this.difKeywords = true
			document.getElementById('afterModifKeywords').innerHTML = this._format.diffString(lastModif.keywords, tags)
		}
		$('.ui.modal.lastModif').modal('refresh').modal('show')
	}

	deleteComment(index) {
		this.wordSel.comments.splice(index, 1)
		this.modifyWordOnAPI();
	} // deleteComment

	modifyWordOnAPI() {
		let dataInfo = new EntryCowaboo(this.wordSel.name, this.wordSel.type, this.wordSel.source, this.wordSel.modules.name, this.wordSel.definition, this.wordSel.meaning, this.wordSel.context, this.wordSel.review, this._format.getOneStringFromArrayString(this.wordSel.keywords), this.wordSel.parent, this.wordSel.timestampCreation, this.wordSel.updates, this.wordSel.comments, false, this.wordSel.commentary, this.wordSel.author.name)

		let dataInfoString = {
			name: dataInfo.name,
			type: dataInfo.type,
			source: dataInfo.source,
			modules: dataInfo.modules,
			definition: dataInfo.definition,
			meaning: dataInfo.meaning,
			context: dataInfo.context,
			review: dataInfo.review,
			keywords: dataInfo.keywords,
			parent: dataInfo.parent,
			timestampCreation: dataInfo.timestampCreation,
			updates: dataInfo.updates,
			comments: dataInfo.comments,
			inactive: false,
		}
		this._httpservice.getEntryJSON(AppSettings.API_WORDS)
		.subscribe(
			data => {
				let hashWord = null
				
				for (let prop in data.dictionary.entries) {
					let obj = JSON.parse(data.dictionary.entries[prop].value)
					if (this.wordSel.name.toLowerCase() == obj.name.toLowerCase()) {
						hashWord = prop
						break;
					}
				}
				if (hashWord != null) {
					this._httpservice.putEntryJSON(dataInfoString, AppSettings.API_WORDS, hashWord, this._userservice.currentUser.secretKey)
					.subscribe( dataModif => { console.log(dataModif) }, errModif => { console.log(errModif); })
				}

			},
			error => { console.log(error); }
		)
	} // modifyWordOnAPI

	addLikeToComment(index) {
		this.wordSel.comments[index].likes.push(this._userservice.currentUser.mail)
		this.modifyWordOnAPI();
	} // addLikeToComment

	findVerb(tag) {
		return tag.endsWith("dre") || tag.endsWith("pre") ||
			tag.endsWith("er") || tag.endsWith("oir") || tag.endsWith("ir")
			|| tag.endsWith("ttre") || tag == 'est' || tag == 'a' || tag.endsWith('é') || tag.endsWith('és')
	} // findVerb

	findAbreviations(word) {
		return word == word.toUpperCase();
	} // findAbreviations

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
	} // verbSelection

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
	} // searchSimilar

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
			tags[index] = el[el.length - 1] != '.' ? el : el.substring(0, el.length - 1)
			var pos = this.searchSimilar(el.substring(0, el.length - 1), tags, index)
			if (pos != -1) {
				tags.splice(pos, 1)
			}
		}
		return tags;
	} // sanitizeMeaningForZone

	numberTimesApparitions(explaination, arrayEntrys) {
		for (let i = arrayEntrys.length - 1; i >= 0; i--) {
			let count = this._format.countSameWord(arrayEntrys[i].name, explaination);
			arrayEntrys[i].count = count;
		}
	} // numberTimesApparitions

	sortTags(arrayEntrys) {
		arrayEntrys.sort(function (a: Entry, b: Entry) { return a.count - b.count; }); // Sort
		if (arrayEntrys.length > 15) {
			let length = arrayEntrys.length
			arrayEntrys = arrayEntrys.slice(length - 15, length); // Take the 15 lasts 
		}
		return arrayEntrys
	} // sortTags

	createRep1(moduleName, entrys) {
		let totalPoints = this._format.getTotalCountEntry(entrys, moduleName);
		let nbTags = entrys.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		let rep
		for (let i = entrys.length - 1; i >= 0; i--) {
			for (var index = 0; index < entrys[i].modulesReputation.length; index++) {
				var element = entrys[i].modulesReputation[index];
				if (moduleName.trim() == element.id.id.trim()) {
					let rep = this._format.getReput(element.count, divisions)
					element.repRule1 = (rep == undefined ? Math.floor(element.count / 16 * 10) : rep) * this.user.settingsGeneral.rule1.coefficient
				}
			}
		}
	} // createRep1

	createRep2(moduleName, listUsers, entries) {
		for (let index = 0; index < entries.length; index++) {
			for (let i = 0; i < entries[index].modulesReputation.length; i++) {
				let el = entries[index].modulesReputation[i];
				if (el.id.id.trim() == moduleName) {
					el.repRule2 = this.allUsers[entries[index].author.name].reputation
				}
			}
		}
	} // createRep2

	createRep3(moduleName, entries) {
		let totalPoints = this._format.getTotalLikes(entries, moduleName);
		let nbTags = entries.length < 16 ? 16 : entries.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		let rep: number
		for (let i = entries.length - 1; i >= 0; i--) {
			for (var index = 0; index < entries[i].modulesReputation.length; index++) {
				var element = entries[i].modulesReputation[index];
				if (moduleName.trim() == element.id.id.trim()) {
					rep = this._format.getReput((entries[i].like.number - entries[i].dislike.number), divisions)
					element.repRule3 = (rep == undefined ? 0 : rep) * this.user.settingsGeneral.rule3.coefficient
				}
			}
		}
		
	} // createRep3

	createRep4(moduleName, entries) {
		let totalPoints = this._format.getTotalSearchClick(entries, moduleName);
		let nbTags = entries.length <= 16 ? 16 : entries.length;
		let divisions = this._format.getDivisions(totalPoints, nbTags);
		let rep: number
		for (let i = entries.length - 1; i >= 0; i--) {
			for (var index = 0; index < entries[i].modulesReputation.length; index++) {
				var element = entries[i].modulesReputation[index];
				if (moduleName.trim() == element.id.id.trim()) {
					rep = this._format.getReput(entries[i].searchClick, divisions)
					element.repRule4 = (rep == undefined ? 0 : rep) * this.user.settingsGeneral.rule4.coefficient
				}
			}
		}
	} // createRep4

	createRep5(moduleName, entries) {
		let today = moment(), entry, element, obj = { nbDays: 0, reputation: 0 }
		for (let i = entries.length - 1; i >= 0; i--) {
			entry = entries[i]
			for (let index = 0; index < entry.modulesReputation.length; index++) {
				element = entry.modulesReputation[index];
				if (moduleName.trim() == element.id.id.trim()) {
					obj = { nbDays: 0, reputation: 0 }
					if (entry.updates[entry.updates.length - 1] != undefined) {
						obj = this.getTimestamp(entry.updates[entry.updates.length - 1].timestamp, today, this.user.settingsGeneral.rule5.coefficient)
						element.repRule5 = obj.reputation
					}
				}
			}
		}
	} // createRep5

	createRep6(moduleName, entries) {
		let today = moment()
		for (let i = entries.length - 1; i >= 0; i--) {
			for (var index = 0; index < entries[i].modulesReputation.length; index++) {
				var element = entries[i].modulesReputation[index];
				if (moduleName.trim() == element.id.id.trim()) {
					let obj = { nbDays: 0, reputation: 0 }
					obj = this.getTimestamp(entries[i].timestamp, today, this.user.settingsGeneral.rule6.coefficient)
					element.repRule6 = obj.reputation
				}
			}
		}
	} // createRep6

	timestampInsertion(nbDays, coef) {
		var idRule = 5
		while (idRule > 0 && nbDays < AppSettings.TIMESTAMPRULE[idRule][0]) {
			idRule--;
		}
		return { nbDays: nbDays, reputation: (AppSettings.TIMESTAMPRULE[idRule][1] * coef) }
	} // timestampInsertion

	getTimestamp(timestamp, today, coef) {
		let start = moment(timestamp), end = today
		let nbDays = end.diff(start, 'days') // Get number of days
		return this.timestampInsertion(nbDays, coef); // rule 5 (Date Insertion)
	} // getTimestamp

	countTotalReputation(context) {
		for (var index = 0; index < context.length; index++) {
			context[index].totalReput = (context[index].repRule1 +
				context[index].repRule2 + context[index].repRule3
				+ context[index].repRule4 + context[index].repRule5 + context[index].repRule6)
		}
	} // countTotalReputation

	countTotalReputationForModule(entries) {
		for (var index = 0; index < entries.length; index++) {
			var el = entries[index].modulesReputation
			for (var i = 0; i < el.length; i++) {
				el[i].totalReput = Math.floor(el[i].repRule1 +
					el[i].repRule2 + el[i].repRule3
					+ el[i].repRule4 + el[i].repRule5 + el[i].repRule6)
			}

		}
	} // countTotalReputationForModule

	initReputationForEachModule(element, modules) {
		for (var index = 0; index < modules.length; index++) {
			var mod = modules[index].trim();
			if (mod != "") {
				if (this.modulesOfWord[mod] != undefined) {
					var object = { id: this.modulesOfWord[mod], repRule1: 0, repRule2: 0, repRule3: 0, repRule4: 0, repRule5: 0, repRule6: 0, totalReput: 0, count: 0 }
					object.count = isNaN(this._format.countSameWord(element.name, this.modulesOfWord[mod].goals.split(' '))) ? 0 : this._format.countSameWord(element.name, this.modulesOfWord[mod].goals.split(' '))
					element.count = element.count + object.count
					element.modulesReputation.push(object);
				}
			}
		}
	} // initReputationForEachModule

	getReputationTotal(el) {
		let count = 0
		for (let index = 0; index < el.modulesReputation.length; index++) {
			count += el.modulesReputation[index].count;
		}
		return count;
	} // getReputationTotal

	getTotalPointsForEachModule(module, allEntries) {
		var totalPoints = 0
		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			for (var cpt = 0; cpt < element.modulesReputation.length; cpt++) {
				var el = element.modulesReputation[cpt];
				if (el.id.id == module.id) {
					totalPoints = totalPoints + el.totalReput
				}
			}
		}
		return totalPoints
	} // getTotalPointsForEachModule

	constructTotalPointsReputation(allEntries) {
		for (let prop in this.modulesOfWord) {
			var mod = this.modulesOfWord[prop];
			mod.totalPoints = this.getTotalPointsForEachModule(mod, allEntries)
		}
		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			for (var cpt = 0; cpt < element.modulesReputation.length; cpt++) {
				var el = element.modulesReputation[cpt];
				el.totalPoints = Math.floor(this.modulesOfWord[el.id.id].totalPoints)
			}
		}
		return allEntries
	} // constructTotalPointsReputation

	constructAnimationReputation(allEntries) {
		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			for (var i = 0; i < element.modulesReputation.length; i++) {
				var ele = element.modulesReputation[i];
				var half = Math.floor(((ele.totalReput * 10) / ele.totalPoints))
				ele.color = half >= 7 ? "#16ab39" : half > 4 ? "#eaae00" : "#db2828"
				ele.animationLeft = "loading-" + (half >= 5 ? (half - 5) * 2 : 0) + " 0.5s linear forwards"
				ele.animationRight = "loading-" + (half >= 5 ? 10 : half * 2) + " 0.5s linear forwards"
			}
		}
		return allEntries
	} // constructAnimationReputation

	deleteWordSearchFromEntries(allEntries, wordSearch) {
		for (let cpt = 0; cpt < allEntries.length; cpt++) {
			if (allEntries[cpt].name == wordSearch.name) {
				allEntries.splice(cpt, 1)
			}
		}
		return allEntries
	} // deleteWordSearchFromEntries

	concatModules(allEntries) {
		for (let prop in this.modulesOfWord) {
			let module = this.modulesOfWord[prop];
			allEntries = allEntries.concat(module.allterms)
		}
		return allEntries
	} // concatModules

	initReputation(allEntries) {
		for (var index = 0; index < allEntries.length; index++) {
			var element = allEntries[index];
			this.initReputationForEachModule(element, element.modules.id)
		}
		return allEntries
	} // initReputation

	getReputationFromAllUsers(allEntries, wordSearch) {
		let promiseGetReputation = []
		for (let prop in this.allUsers) {
			promiseGetReputation.push(this._httpservice.getUserReputationPromise(this.allUsers[prop].publicKey))
		}

		Observable.forkJoin(promiseGetReputation).subscribe((data: any) => {
			console.log(data)
			let allEnt = Object.keys(this.allUsers)
			for (var index = 0; index < allEnt.length; index++) {
				this.allUsers[allEnt[index]].reputation = Number(data[index]._body)
			}
			for (let prop in this.modulesOfWord) {
				this.createRep2(this.modulesOfWord[prop].id, this._wordsservice.users.user_list.list, allEntries) // Réputation P
			}
			this.countTotalReputationForModule(allEntries)
			allEntries = this.constructTotalPointsReputation(allEntries)
			allEntries = this.constructAnimationReputation(allEntries)
			allEntries = this.deleteWordSearchFromEntries(allEntries, wordSearch)
		});
	} // getReputationFromAllUsers
	

	createContext(wordSearch) {
		let today = moment(), instance = this, allEntries: Array<Entry> = []
		
		allEntries = this.concatModules(allEntries)
		allEntries = this._format.uniqueEntries(allEntries, AppSettings.NAME)
		allEntries = this.deleteWordSearchFromEntries(allEntries, wordSearch)
		allEntries = this.initReputation(allEntries)		
		allEntries = this.sortTags(allEntries)

		this.initReputationForEachModule(wordSearch, wordSearch.modules.id)
		allEntries.push(wordSearch)

		this.getReputationFromAllUsers(allEntries, wordSearch)
		
		for (let prop in this.modulesOfWord) {
			let el = this.modulesOfWord[prop];
			this.createRep1(el.id, allEntries) // Interne
			this.createRep3(el.id, allEntries) // Avis sur le contenu
			this.createRep4(el.id, allEntries) // Vue / clic
			this.createRep5(el.id, allEntries) // Mise à jour
			this.createRep6(el.id, allEntries) // Timestamp création
		}

		this.countTotalReputationForModule(allEntries)

		allEntries = this.constructTotalPointsReputation(allEntries)
		allEntries = this.constructAnimationReputation(allEntries)

		instance.wordSel = Object.assign({}, instance.wordSearch);
		instance.allEntries = allEntries

		if (instance._manager3d.engine != null) {
			instance._manager3d.createScene(wordSearch, allEntries, instance.wordSel, instance.modulesOfWord, this.user);
			instance._manager3d.runRender();
		}
		
		setTimeout(function () {
			instance.loading = false;
			instance._userservice.getReputation(instance._wordsservice.users.user_list.list[instance.wordSel.author.name])
			.subscribe( rep => { instance.wordSel.author.reputation = rep } )
		}, 1);

	} // createContext

	/*
	let wordSelected
	for (var index = 0; index < allEntries.length; index++) {
		let element = allEntries[index];
		if (element.name == wordSearch.name) {
			wordSelected = element
			allEntries.splice(index, 1)
		}

		/*
		instance._manager3d.startEngine('renderCanvas');*/

		//console.log('#popupKeywords')
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
			element.0;
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
					
					for (var cpt = instance.contextEntrys.length - 1; cpt >= 0 ; cpt--) {
						if (instance.contextEntrys[cpt].meaning == "" || instance.contextEntrys[cpt].meaning == undefined && instance.contextEntrys.length > 5) {instance.contextEntrys.splice(cpt, 1)}
					}
					console.log(instance.contextEntrys)
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

	addComment() {
		if (this.newComment != "" && this.wordFind) {
			console.log('ici')
			this.loadingAddComment = true
			let dataInfo = new EntryCowaboo(this.wordSel.name, this.wordSel.type, this.wordSel.source, this.wordSel.modules.name, this.wordSel.definition, this.wordSel.meaning, this.wordSel.context, this.wordSel.review, this._format.getOneStringFromArrayString(this.wordSel.keywords), this.wordSel.parent, this.wordSel.timestampCreation, this.wordSel.updates, this.wordSel.comments, false, this.wordSel.commentary, this.wordSel.author.name)
			let commentToInsert = new Comment(this.newComment, this._userservice.currentUser.mail + " [" + this._userservice.currentUser.group + "]", this._format.getTodayTimestamp(), [])

			if (this._userservice.currentUser.group != AppSettings.RULELAMBDA) {
				dataInfo.comments.push(commentToInsert)
				let dataInfoString = {
					name: dataInfo.name,
					type: dataInfo.type,
					source: dataInfo.source,
					modules: dataInfo.modules,
					definition: dataInfo.definition,
					meaning: dataInfo.meaning,
					context: dataInfo.context,
					review: dataInfo.review,
					keywords: dataInfo.keywords,
					parent: dataInfo.parent,
					timestampCreation: dataInfo.timestampCreation,
					updates: dataInfo.updates,
					comments: dataInfo.comments,
					inactive: false,
				}
				this._httpservice.getEntryJSON(AppSettings.API_WORDS)
					.subscribe(
					data => {
						let hashWord = null
						let obj
						for (let prop in data.dictionary.entries) {
							obj = JSON.parse(data.dictionary.entries[prop].value)
							if (this.wordSel.name.toLowerCase() == obj.name.toLowerCase()) {
								hashWord = prop
								break;
							}
						}
						this._httpservice.putEntryJSON(dataInfoString, AppSettings.API_WORDS, hashWord, this._userservice.currentUser.secretKey)
							.subscribe(
							dataModif => {
								console.log(dataModif)
								this.loadingAddComment = false
								this.newComment = "";
							},
							errModif => { console.log(errModif); this.loadingAddComment = false }
							)

					},
					error => { console.log(error); this.loadingAddComment = false }
					)
			} else {
				this.sendRequest(dataInfo.name, commentToInsert, AppSettings.TYPEREQUESTREVISION, AppSettings.TEXTREQUESTREVISON)
			}

		}
	} // addComment

	addModule() {
		if (this.newModuleObj.id == "" || this.newModuleObj.name == "" || this.newModuleObj.goals == "") {
			this.errorAddModule = true;
			this.errorTextAddModule = "Veuillez compléter tous les champs requis : N° du module, Nom du module et Objectifs du module"
		} else {
			if (this.nameTakenModule) {
				this.errorAddModule = true;
				this.errorTextAddModule = "Veuillez choisir un autre n° pour l'identifiant du module, car ce dernier a déjà été utilisé !"
				return
			}
			this.errorAddModule = false;
			this.loadingAddModule = true;
			this._httpservice.postEntryJSON(this.newModuleObj, AppSettings.API_MODULES, this.newModuleObj.id, this._userservice.currentUser.secretKey)
			.subscribe(
				data => {
					console.log(data);
					this.loadingAddModule = false;
					var element: any = {}
					element.selected = true;
					element.text = this.newModuleObj.id;
					element.name = this.newModuleObj.id + " - " + this.newModuleObj.name
					element.value = this.newModuleObj.id;
					this.valuesModules.push(element)
					this.switchModule(false, 'A')
					$('.ui.dropdown.multiple').dropdown({ values: this.valuesModules })
					this.newModuleObj = { id: "", name: "", goals: "" }
					this._alert.create('success', 'Le module a été inséré avec succès, il se trouve désormais avec les existants !');
				}
			)
		}
	} // addModule

	isUnique(idChoice, idSelectTagHtml, property) {
		let instance = this;
		let word = (idChoice == 0 ? instance.word : instance.newModuleObj.id)
		let apiObservatory = (idChoice == 0 ? AppSettings.API_WORDS : AppSettings.API_MODULES)
		if (word != "") {
			$(idSelectTagHtml).removeClass('info');
			$(idSelectTagHtml).addClass('circle');
			$(idSelectTagHtml).addClass('notched');
			$(idSelectTagHtml).addClass('loading');
			if (idChoice == 0) { instance.nameChosen = true } else { instance.nameChosenModule = true }
			this._httpservice.getEntryJSON(apiObservatory)
				.subscribe(
				function (response) {
					let obj = response.dictionary.entries;
					let data
					let count = 0;
					let props = Object.keys(obj)

					let i = 0
					while (i <= props.length - 1 && count < 1) {
						data = JSON.parse(obj[props[i]].value);
						count = count + ((word.toLowerCase() == data[property].toLowerCase() && data[property].toLowerCase() != instance.wordSel.name.toLowerCase()) ? 1 : 0);
						i++
					}

					setTimeout(function () {
						$(idSelectTagHtml).removeClass('circle');
						$(idSelectTagHtml).removeClass('notched');
						$(idSelectTagHtml).removeClass('loading');
						$(idSelectTagHtml).addClass('info');
					}, 200);
					if (idChoice == 0) {
						instance.nameTaken = count >= 1
						instance.msgNameTaken = instance.nameTaken ? "Ce nom existe déjà !" : "Ce nom est disponible";
					} else {
						instance.nameTakenModule = count >= 1
						instance.msgIdModuleTaken = instance.nameTakenModule ? "Ce n° a déjà été choisi !" : "Ce n° est disponible";
					}
				}
				)
		} else {
			if (idChoice == 0) { instance.nameChosen = false } else { instance.nameChosenModule = false }
		}
	} // isUnique

	getModulesValues() {
		this.valuesModules.splice(0, this.valuesModules.length)
		this.valuesModules.push(...this.modules)
		for (var index = 0; index < this.valuesModules.length; index++) {
			var element = this.valuesModules[index];
			element.selected = false;
			element.text = element.id;
			element.name = element.id + " - " + element.name
			element.value = element.id;
		}
		$('.ui.dropdown.multiple').dropdown({ values: this.valuesModules })
	} // getModulesValues

	getData(observatory, table: Array<any>) {
		let instance = this;
		this._httpservice.getEntryJSON(observatory)
			.subscribe(
			function (response) { // The communication with the API has matched
				console.log(response); // Transform js object into json
				let obj = response.dictionary.entries;
				for (let prop in obj) { table.push(table == instance.modules ? JSON.parse(obj[prop].value) : obj[prop]); }
				if (table == instance.modules) {
					instance.getModulesValues()
				}
			},
		)
	} // getData

	ngOnInit() {
		this.loading = true;
		this.col1 = this.user.settingsGeneral.colSearchTerm
		this.col2 = this.user.settingsGeneral.colKeyWords
		this.col3 = this.user.settingsGeneral.colModule
		this.col4 = this.user.settingsGeneral.colOtherTerms
		this.onCreate();
		let instance = this;
		instance.types.splice(0, instance.types.length);
		instance.contexts.splice(0, instance.contexts.length);
		instance.modules.splice(0, instance.contexts.length);
		instance.types.push({ name: 'Aucun', value: 'Aucun', selected: true })
		instance.contexts.push({ name: 'Aucun', value: 'Aucun', selected: true })
		instance.getData(AppSettings.API_TYPES, instance.types); // Get the data of types
		instance.getData(AppSettings.API_CONTEXT, instance.contexts); // Get the data of contexts
		instance.getData(AppSettings.API_MODULES, instance.modules); // Get the data of contexts
	} //ngOnInit

	validated() { // Function who validates if everything is ok before the insert
		return this.word != "" && this.source != "" && this.meaning != ""; // Value required to insert
	} // validated

	reinit() {
		this.word = "";
		this.source = ""; // Separate with the comma
		this.definition = "";
		this.meaning = "";
		this.newModules = "";
	} // reinit

	saveModifications() {
		if(this.validated()) {
			this.loadingModif = true;
			let tags = "";
			for (var index = 0; index < this.items.length; index++) {
				var element = this.items[index];
				tags = tags + element.display + (index == this.items.length - 1 ? "" : ", ")
			}

			let instance = this;


			let modules = this.newModules.split(',');
			let modulesNotNew = $('.ui.dropdown.multiple').dropdown('get value');
			let type = $('#select-types').dropdown('get value') == "Aucun" ? "" : $('#select-types').dropdown('get value');
			let context = $('#select-context').dropdown('get value') == "Aucun" ? "" : $('#select-context').dropdown('get value')

			let updatesVersions: Array<Update> = Object.assign([], this.wordSel.updates)
			let lastVersion = new EntryCowaboo(this.wordSel.name, this.wordSel.type, this.wordSel.source, this.wordSel.modules.name, this.wordSel.definition, this.wordSel.meaning, this.wordSel.context, this.wordSel.review, this._format.getOneStringFromArrayString(this.wordSel.keywords), this.wordSel.parent, this.wordSel.timestampCreation, [], [], false, this.wordSel.commentary, this.wordSel.author.name)

			updatesVersions.push(new Update(lastVersion, this._format.getTodayTimestamp(), this._userservice.currentUser.mail, true))




			let dataInfo = new EntryCowaboo(this.word, type, this.source, modulesNotNew, this.definition, this.meaning, context, this.wordSel.review, tags, this.wordSel.parent, this.wordSel.timestampCreation, updatesVersions, this.wordSel.comments, false, this.wordSel.commentary, this.wordSel.author.name)

			let dataInfoString = {
				name: dataInfo.name,
				type: dataInfo.type,
				source: dataInfo.source,
				modules: dataInfo.modules,
				definition: dataInfo.definition,
				meaning: dataInfo.meaning,
				context: dataInfo.context,
				review: dataInfo.review,
				keywords: dataInfo.keywords,
				parent: dataInfo.parent,
				timestampCreation: dataInfo.timestampCreation,
				updates: dataInfo.updates,
				comments: dataInfo.comments,
				inactive: false,
			}
			if (this._userservice.currentUser.group == AppSettings.RULEADMINISTRATOR) {

				instance._httpservice.getEntryJSON(AppSettings.API_WORDS)
					.subscribe(
					data => {
						let hashWord = null
						let obj
						for (let prop in data.dictionary.entries) {
							obj = JSON.parse(data.dictionary.entries[prop].value)
							if (this.wordSel.name.toLowerCase() == obj.name.toLowerCase()) {
								hashWord = prop
								break;
							}
						}
						instance._httpservice.putEntryJSON(dataInfoString, AppSettings.API_WORDS, hashWord, this._userservice.currentUser.secretKey)
							.subscribe(
							hashGenerated => {
								console.log(hashGenerated);
								$('.ui.modal').modal('hide all');
								this.wordSel.name = dataInfoString.name
								this.wordSel.type = dataInfoString.type
								this.wordSel.source = dataInfoString.source
								this.wordSel.definition = dataInfoString.definition
								this.wordSel.meaning = dataInfoString.meaning
								this.wordSel.context = dataInfoString.context
								this.wordSel.updates = dataInfoString.updates
								this.wordSel.modules.id = dataInfoString.modules.split(',')
								this.wordSel.modules.name = dataInfoString.modules
								this.wordSel.keywords = dataInfoString.keywords.split(', ')
								this.loadingModif = false
								this._alert.create('success', AppSettings.MSG_SUCCESS_MODIFICATION);
							},
							e => { console.log(e) }
							)
					},
					error => { console.log(error) }
					)
			} else {
				this.sendRequest(dataInfoString.name, dataInfoString, AppSettings.TYPEREQUESTMODIFY, AppSettings.TEXTREQUESTMODIFY)
			}

		} else {
			this._alert.create('warning', AppSettings.MSGINCOMPLETED);
			this.loadingModif = false
		}
	} // saveModifications

	sendRequest(name, dataInfo, type, textType) {
		let request: Request = new Request(type)
		request.user = this._userservice.currentUser.mail
		request.timestamp = this._format.getTodayTimestamp()
		request.textType = textType
		if (request.type == 4) { dataInfo.name = name }
		request.content = dataInfo
		request.publicKeySender = this._userservice.currentUser.publicKey
		this._httpservice.postEntryJSON(request, AppSettings.API_REQUESTS, type + "-" + name + (type == AppSettings.TYPEREQUESTREVISION ? "-" + request.timestamp : ""), this._userservice.currentUser.secretKey)
			.subscribe(
			res => {
				if (type == AppSettings.TYPEREQUESTMODIFY) {
					$('.ui.modal').modal('hide all');
					this.loadingModif = false
					this._alert.create('success', "La communauté vous remercie d'avoir proposer de modifier l'entrée : " + name + ", sur GraphTolearn. Votre modification sera soit accepter, soit refuser par des membres éditeurs ou administrateurs et vous serez notifier dès qu'elle sera traitée", { duration: 30000 })
				} else {
					this.loadingAddComment = false
					this.newComment = "";
					this._alert.create('success', "La communauté vous remercie pour votre implication et votre commentaire proposer pour l'entrée : " + name + ". Votre commentaire sera soit accepter, soit refuser par des membres éditeurs ou administrateurs et vous serez notifier dès qu'elle sera traitée", { duration: 30000 })
				}
			}
		)
	} // sendRequest

	switchModule(val, choice) {
		this.newModule = val;
		this.styleModuleNew = (choice == 'A' ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleNewCol = (choice == 'A' ? AppSettings.BLACK : AppSettings.WHITE);
		this.styleModuleEx = (choice == 'B' ? AppSettings.WHITEMOREDARK : AppSettings.GREY);
		this.styleModuleExCol = (choice == 'B' ? AppSettings.BLACK : AppSettings.WHITE);
	} // switchModule


}