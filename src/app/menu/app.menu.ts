import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { AuthService } from '../login/app.authservice';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { User } from '../model/user'
import { Feedback } from '../model/feedback'
import { SettingsReputation } from '../model/settings-reputation'
import { Proposition } from '../model/proposition'
import { UserService } from '../model/user-service'
import { HistorySearchService } from '../model/history-search'

declare var $: any;

@Component({
	selector: 'app-menu',
	templateUrl: './app.menu.html',
	styleUrls: ['../app.component.css'],
})

export class MenuComponent {

	public isConnected
	public nbNewMembers = 0
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
	public loadingAdd: boolean
	public error: boolean
	public settingsReputation : SettingsReputation = new SettingsReputation()

	constructor(private _httpService: HttpAPIService, private _authservice: AuthService, private _router: Router, private _userservice: UserService, private _historysearch: HistorySearchService) {
		this.initVariables()
		_userservice.getCurrentUser()
			.then(
				data => { 
					this.user = this._userservice.currentUser ; 
					this.init()
					this._httpService.getEntryJSON(AppSettings.API_MEMBERS)
					.subscribe(
						data=> {
							let entries = JSON.parse(data.dictionary.entries[Object.keys(data.dictionary.entries)[0]].value)
							let members = [];
							for (let prop in entries) {
								if (entries[prop].validated == false && entries[prop].refusedBy == undefined) {
									entries[prop].mail = prop
									members.push(entries[prop])
								}
							}
							this.nbNewMembers = members.length
						}
					)
				}
			)
		
	}

	init() {
		this.historySearch = this._historysearch.getLastSearches()
		this._httpService.getEntryJSON(AppSettings.API_FEEDBACK)
			.subscribe(
			data => {
				this.feedbacks = data.dictionary.conf[AppSettings.API_METAFEEDBACKPROP]
				if (this.feedbacks != undefined) {
					var el = null
					console.log(this._userservice.currentUser.mail)
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
		this.isConnected = false
		this.active = [true, false, false, false]
		this.colSearchTerm = AppSettings.COL_SEARCH_TERM
		this.colKeyWords = AppSettings.COL_KEY_WORDS
		this.colModule = AppSettings.COL_MODULE
		this.colOtherTerms = AppSettings.COL_OTHER_TERMS
		this.historySearch = []
		this.feedbacks = []
		this.allFeedbacks = []
		this.myFeedback = new Feedback()
		this.newProposition = "";
		this.modifyFeedback = -1;
		this.loadingAdd = false;
		this.error = false;
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

		console.log(this.myFeedback)
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

					this.historySearch = this._historysearch.getLastSearches()
					$('.ui.sidebar').sidebar('toggle')
				},
				error => { }
				)
		} else {
			this.historySearch = this._historysearch.getLastSearches()
			$('.ui.sidebar').sidebar('toggle')
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
		AppSettings.COL_SEARCH_TERM = this.colSearchTerm
		AppSettings.COL_KEY_WORDS = this.colKeyWords
		AppSettings.COL_MODULE = this.colModule
		AppSettings.COL_OTHER_TERMS = this.colOtherTerms
		if (this._userservice.currentUser.group == AppSettings.RULEADMINISTRATOR) {
			this.settingsReputation.repIntegrationEditor = Number(this.settingsReputation.repIntegrationEditor)
			this.settingsReputation.repContribution = Number(this.settingsReputation.repContribution)
			this.settingsReputation.repNew = Number(this.settingsReputation.repNew)
			this.settingsReputation.repModify = Number(this.settingsReputation.repModify)
			this.settingsReputation.repRevision = Number(this.settingsReputation.repRevision)
	
			this._httpService.postEntryJSON(this.settingsReputation, AppSettings.API_SETTINGS, AppSettings.TAGSETTINGS, this.user.secretKey)
				.subscribe(
					res => {console.log(res); this._userservice.currentUser.settingsReputation = this.settingsReputation; $('.ui.modal').modal('hide all')}
				)		
		}
	
	}

	searchSelectedWord(word) {

		console.log(word)
		$('.ui.sidebar').sidebar('toggle')
		this._router.navigate(['search/' + word]);
	}

	showOptions() {
		this.settingsReputation = Object.assign({},this.user.settingsReputation);
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
					return true;
				},
				onApprove: function () {
					instance._authservice.logout();
				}
			}).modal('show')
	}

}