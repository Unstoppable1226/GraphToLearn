/* Core */
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, ActivatedRoute } from '@angular/router';
import { Observable, Observer } from 'rxjs/Rx';

/* Services */
import { HttpAPIService } from '../api/app.http-service';

/* Constantes */
import { AppSettings } from '../settings/app.settings';
import { AuthService } from '../login/app.authservice';
import { UserService } from '../model/user-service';
import { WordsService } from '../model/words-service';
import { HistorySearchService } from '../model/history-search';

/* Tools */
import { Formatter } from '../tools/app.formatter';

/* Alerts */
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

/* Model */
import { User } from '../model/user'
import { Feedback } from '../model/feedback'
import { SettingsReputation } from '../model/settings-reputation'
import { SettingsGeneral } from '../model/settings-general'
import { Proposition } from '../model/proposition'

declare var $: any;

@Component({
	selector: 'app-menu',
	templateUrl: './app.menu.html',
	styleUrls: ['../app.component.css'],
})

export class MenuComponent implements OnInit {

	public isConnected
	public nbNewMembers = 0
	public nbReputationGained = 0
	public requestsAnswered = []
	public active
	public user
	public colSearchTerm
	public colKeyWords
	public colModule
	public colOtherTerms
	public historySearch
	public newProposition: string
	public myFeedback: Feedback
	public feedbacks: any
	public allFeedbacks: Array<Proposition>
	public modifyFeedback: number
	public loadingSaveOptions: boolean
	public loadingRequests: boolean
	public loadingAdd: boolean
	public error: boolean
	public settingsReputation: SettingsReputation
	public settingsGeneral: SettingsGeneral



	constructor(private _httpService: HttpAPIService, private _alert: AlertsService, private _wordsservice: WordsService, private _format: Formatter, private _authservice: AuthService, private _router: Router, private _userservice: UserService, private _historysearch: HistorySearchService) {
		$('.ui.left.vertical.menu.sidebar.inverted').remove()
	}

	ngOnInit() {
		let instance = this;
		this.initVariables()
		this._userservice.getCurrentUser()
			.then(
			data => {
				this.user = this._userservice.currentUser;
				this.settingsGeneral = this._userservice.currentUser.settingsGeneral;
				this.init()
				this._httpService.getEntryJSON(AppSettings.API_MEMBERS)
					.subscribe(
					data => {
						let members = [];
						if (this.user.group == 'Administrator' || this.user.group == 'Editor') {
							let entries = JSON.parse(data.dictionary.entries[Object.keys(data.dictionary.entries)[0]].value)
							for (let prop in entries) {
								if (entries[prop].validated == false && entries[prop].refusedBy == undefined) {
									entries[prop].mail = prop
									members.push(entries[prop])
								}
							}
						}

						this._httpService.getEntryJSON(AppSettings.API_REQUESTS)
							.subscribe(

							requests => {
								let nbReputGained = 0
								this.nbNewMembers = (Object.keys(requests.dictionary.entries).length + members.length)
								for (let prop in requests.dictionary.entries) {
									var element = JSON.parse(requests.dictionary.entries[prop].value);
									if (element.user == this._userservice.currentUser.mail && element.result != null && element.isVisited == undefined) {
										element.hash = prop
										nbReputGained += Number(element.reputationGained)
										this.requestsAnswered.push(element)
									}
								}
								if (this.requestsAnswered.length > 0) {
									this.nbReputationGained += nbReputGained
									this._userservice.getReputation(this._userservice.currentUser.publicKey).subscribe(
										reput => {
											this._userservice.currentUser.reputation = reput;
											$('#requests').modal({ closable: false }).modal('refresh').modal('show')
										}
									)
								}
							}
							)

					}
					)
			}, error => {
				setTimeout(function () {
					instance.ngOnInit()
				}, 300);
			}
			)
	}

	init() {
		//this.historySearch = this._historysearch.getLastSearches()
		this._httpService.getEntryJSON(AppSettings.API_FEEDBACK)
			.subscribe(
			data => {
				this.feedbacks = data.dictionary.conf[AppSettings.API_METAFEEDBACKPROP]
				if (this.feedbacks != undefined) {
					var el = null
					for (var index = 0; index < this.feedbacks.length; index++) {
						var element: Feedback = this.feedbacks[index][Object.keys(this.feedbacks[index])[0]]
						this.allFeedbacks.push(...element.propositions)

						if (element.author == this._userservice.currentUser.mail) {
							el = element
							this.modifyFeedback = index;
						}
					}
					this.myFeedback = (el == null ? new Feedback() : el)

				} else {
					this.feedbacks = []
					this.allFeedbacks = []
					this.modifyFeedback = -1;
					this.myFeedback = new Feedback()
				}
				$('.ui.rating').rating('set rating', + this.myFeedback.rating)

			},
			err => { }
			)
	}

	initVariables() {
		this.user = new User();
		this.nbReputationGained = 0;
		this.isConnected = false
		this.active = [true, false, false, false]
		this.colSearchTerm = AppSettings.COL_SEARCH_TERM
		this.colKeyWords = AppSettings.COL_KEY_WORDS
		this.colModule = AppSettings.COL_MODULE
		this.colOtherTerms = AppSettings.COL_OTHER_TERMS
		this.historySearch = []
		this.feedbacks = []
		this.allFeedbacks = []
		this.settingsReputation = new SettingsReputation()
		this.settingsGeneral = new SettingsGeneral()
		this.myFeedback = new Feedback()
		this.newProposition = "";
		this.modifyFeedback = -1;
		this.requestsAnswered = [];
		this.loadingSaveOptions = false;
		this.loadingRequests = false;
		this.loadingAdd = false;
		this.error = false;
	}

	getHashWord(element){
		return new Promise((resolve, reject) => {
			this._httpService.getEntryJSON(AppSettings.API_REQUESTS)
			.subscribe(
				requests => {
					let entries = requests.dictionary.entries;
					let tag = ""
					if (element.type == 1) {
						tag = AppSettings.TYPEREQUESTRULE + "-" + element.user
					} else if (element.type == 2) {
						tag = AppSettings.TYPEREQUESTNEW + "-" + element.content.name
					} else if (element.type == 3) {
						tag = AppSettings.TYPEREQUESTMODIFY + "-" + element.content.name
					} else {
						tag = AppSettings.TYPEREQUESTREVISION + "-" + element.content.name + "-" + element.timestamp
					}
					let hash = ""
					for (let prop in entries) {
						var tags = entries[prop].tags;
						if (tags == ("||" + tag + "||")) {element.hash = prop}
					}
					resolve(hash)
				})
			})
	}


	hideModalMyRequests() {
		let length = this.requestsAnswered.length - 1
		this.loadingAdd = true
		let promisesAll = []
		let isRuleChanged = ""
		let instance = this;

		for (let index = 0; index < this.requestsAnswered.length; index++) {
			let element = instance.requestsAnswered[index];
			if (element.type == 1) { isRuleChanged = element.rule; }
			
			this._httpService.deleteEntryJSON(this._userservice.currentUser.secretKey, AppSettings.API_REQUESTS, element.hash ).subscribe(
				res => {
					if (index == length) {
						this.requestsAnswered.splice(0, this.requestsAnswered.length)
						if (isRuleChanged != "") { this.user.group == isRuleChanged; this._userservice.currentUser.group == isRuleChanged }
						this.loadingAdd = false
						$('#requests').modal('hide')
					} else {
						console.log(index)
					}
				}
			)
			
		}
	}

	isValidNumber(value, id) {
		let instance = this;
		setTimeout(function () {
			switch (id) {
				case 1:
					if (value.repIntegrationEditor > 20) { value.repIntegrationEditor = 20; } else if (value.repIntegrationEditor < 1) { value.repIntegrationEditor = 1; }
					break;
				case 2:
					if (value.repIntegrationAdministrator > 100) { value.repIntegrationAdministrator = 100; } else if (value.repIntegrationAdministrator < 1) { value.repIntegrationAdministrator = 1; }
					break;
				case 3:
					if (value.repContribution > 20) { value.repContribution = 20; } else if (value.repContribution < 1) { value.repContribution = 1; }
					break;
				case 4:
					if (value.repModify > 20) { value.repModify = 20; } else if (value.repModify < 1) { value.repModify = 1; }
					break;
				case 5:
					if (value.repNew > 20) { value.repNew = 20; } else if (value.repNew < 1) { value.repNew = 1; }
					break;
				case 6:
					if (value.repRevision > 20) { value.repRevision = 20; } else if (value.repRevision < 1) { value.repRevision = 1; }
					break;
			}
		}, 1)
	}

	isValidNumberRules(value, id) {
		let instance = this;
		setTimeout(function () {
			if (value['rule'+ id].coefficient > 20) { value['rule'+ id].coefficient = 20} else if (value['rule'+ id].coefficient  < 1) { value['rule'+ id].coefficient = 1; }
		}, 1)
	}

	focusProposition() {
		this.error = false;
	}

	addProposition() {
		if (this.newProposition.trim() == "") {
			this.error = true;
			return
		}
		this.loadingAdd = true
		let obj = {}
		let today = new Date()
		let prop: Proposition = new Proposition(this.newProposition, today.getDate() + "/" + today.getMonth() + "/" + today.getFullYear() + " " + today.getHours() + ":" + today.getMinutes(), this._userservice.currentUser.mail)
		let props: Array<Proposition> = this.myFeedback.propositions

		props.push(prop)
		this.myFeedback.propositions = props
		this.myFeedback.rating = ($('.ui.rating').rating('get rating')[1] == undefined ? $('.ui.rating').rating('get rating') : $('.ui.rating').rating('get rating')[1])
		this.myFeedback.author = this._userservice.currentUser.mail

		obj[this._userservice.currentUser.mail] = this.myFeedback

		if (this.modifyFeedback == -1) {
			this.feedbacks.push(obj)
		} else {
			this.feedbacks[this.modifyFeedback] = obj
		}

		this._httpService.postObservatoryMetadata(AppSettings.API_METAFEEDBACKPROP, JSON.stringify(this.feedbacks), AppSettings.API_FEEDBACK, this._userservice.currentUser.secretKey)
			.subscribe(
			data => { console.log(data); this.newProposition = "", this.allFeedbacks.splice(0, this.allFeedbacks.length); this.init(); this.loadingAdd = false },
			err => { console.log(err) }
			)
	}

	showHistorySearch() {
		$('.ui.sidebar').sidebar({ transition: 'overlay', useLegacy: true }).sidebar('toggle').sidebar('setting', {
			onHide: function () {
				$('.pusher').removeClass('pusher dimmed')
			}
		})
	}

	toggleSideBar() {
		if (this.historySearch.length == 0) {
			this._httpService.getEntryJSON(AppSettings.API_HISTORY)
				.subscribe(
				data => {
					try {
						this._historysearch.lastSearches = JSON.parse(data.dictionary.conf[this._userservice.currentUser.mail])
					} catch (error) {
						this._historysearch.lastSearches = data.dictionary.conf[this._userservice.currentUser.mail]
					}
					if (this._historysearch.lastSearches == undefined) { this._historysearch.lastSearches = [] }
					this.historySearch = this._historysearch.getLastSearches()
					this.showHistorySearch()
				}
				)
		} else {
			this.historySearch = this._historysearch.getLastSearches()
			this.showHistorySearch()
		}
	}

	ngAfterViewInit() {
		$('.ui.rating')
			.rating({
				initialRating: 0,
				maxRating: 5
			});
		$('.menu .item').tab();

	}

	delete() {
		this._historysearch.lastSearches.splice(0, this._historysearch.lastSearches.length)
		this._httpService.postObservatoryMetadata(this._userservice.currentUser.mail, JSON.stringify(this._historysearch.getLastSearches()), AppSettings.API_HISTORY, this._userservice.currentUser.secretKey)
			.subscribe(function (response) { console.log(response); })
	}

	saveOptions() {
		this.loadingSaveOptions = true
		this._userservice.currentUser.settingsGeneral = this.settingsGeneral
		this._httpService.getEntryJSON(AppSettings.API_MEMBERS)
			.subscribe(
			users => {
				let props = Object.keys(users.dictionary.entries)
				let allUsers = JSON.parse(users.dictionary.entries[props[0]].value)
				allUsers[this._userservice.currentUser.mail].settingsGeneral = this.settingsGeneral
				this._httpService.postEntryJSON(allUsers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
					.subscribe(
						data => {
							console.log(data)
							if (this._userservice.currentUser.group == AppSettings.RULEADMINISTRATOR) {
								this.settingsReputation.repIntegrationEditor = Number(this.settingsReputation.repIntegrationEditor)
								this.settingsReputation.repIntegrationAdministrator = Number(this.settingsReputation.repIntegrationAdministrator)
								this.settingsReputation.repContribution = Number(this.settingsReputation.repContribution)
								this.settingsReputation.repNew = Number(this.settingsReputation.repNew)
								this.settingsReputation.repModify = Number(this.settingsReputation.repModify)
								this.settingsReputation.repRevision = Number(this.settingsReputation.repRevision)

								this._httpService.postEntryJSON(this.settingsReputation, AppSettings.API_SETTINGS, AppSettings.TAGSETTINGS, this.user.secretKey)
									.subscribe(
									res => { console.log(res); this._userservice.currentUser.settingsReputation = this.settingsReputation; this.loadingSaveOptions = false; this._alert.create('success', AppSettings.MSG_SUCCESS_MODIFICATION); $('.ui.modal').modal('hide all') }
									)
							} else {
								this.loadingSaveOptions = false
							}
						},
						error => {
							this.loadingSaveOptions = false; this._alert.create('error', AppSettings.MSG_ERROR_MODIFICATION)
						}
					)
			},
			error => {
				this.loadingSaveOptions = false; this._alert.create('error', AppSettings.MSG_ERROR_MODIFICATION);
			}
		)
	}

	searchSelectedWord(word) {
		$('.ui.sidebar').sidebar('hide')
		this._router.navigate(['search/' + word]);
	}

	showOptions() {
		this.settingsReputation = Object.assign({}, this.user.settingsReputation);
		$('.ui.options.modal').modal('show')
	}

	showInfo() {
		$('.ui.modal.info').modal('show', 'refresh')
	}

	showFeedBack() {
		$('.ui.modal.feedback').modal('show', 'refresh')
	}

	hideModalOptions() {
		$('.ui.modal').modal('hide all')
	}

	changeActiveMenuItem(id, route) {
		for (var i = this.active.length - 1; i >= 0; i--) { this.active[i] = false; }
		this.active[id] = true;
		this._router.navigate([route]);
	}

	logout() {
		let instance = this;
		$('.ui.mini.modal')
			.modal({
				closable: false,
				onDeny: function () {
					$('.ui.modal').modal('hide all')
					instance._format.deleteAllModals()
					return true;
				},
				onApprove: function () {
					$('.ui.modal').modal('hide all')
					instance._format.deleteAllModals()
					instance._authservice.logout();
				}
			}).modal('show')
	}

}