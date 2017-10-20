import { Component, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';

import { Entry } from '../model/entry'
import { User } from '../model/user'
import { Request } from '../model/request'

import { UserService } from '../model/user-service';
import { HistorySearchService } from '../model/history-search';

declare var $: any; // This is necessary if you want to use jQuery in the app

@Component({
	selector: 'profile',
	templateUrl: './app.profile.html',
})

export class AppProfile implements OnInit {
	
	public user : User
	public allUsers = {};
	public nbWordsInserted : number
	public loadingChangeRuleLambda : boolean
	public loadingChangeRuleEditor: boolean
	public loadingChangeRuleAdministrator : boolean

	constructor(private _httpService: HttpAPIService, private _format: Formatter, private _alert: AlertsService, private _userservice: UserService, private _historysearch: HistorySearchService) {
		this._format.deleteAllModals()
    }
    
    ngOnInit() {
		this.initVariables()
		this._userservice.getCurrentUser().then(
			(user : User)=> { this.user = user; this.getWords() }
		)
		this.getAllUsers()
	}

	initVariables() {
		this.user = new User()
		this.loadingChangeRuleLambda = false
		this.loadingChangeRuleEditor = false
		this.loadingChangeRuleAdministrator = false
		this.nbWordsInserted = 0
	}

	getAllUsers() {
		this._httpService.getEntryJSON(AppSettings.API_MEMBERS)
		.subscribe(
			members => {
				this.allUsers = JSON.parse(members.dictionary.entries[Object.keys(members.dictionary.entries)[0]].value)
			}
		)
	}

	getWords() {
		this._httpService.getEntryJSON(AppSettings.API_WORDS)
		.subscribe( words => { this.countWordsInserted(words) } )
	}

	countWordsInserted(words) {
		let entries = words.dictionary.entries, el, count : number = 0;
		for (let prop in entries) {
			el = JSON.parse(entries[prop].value)
			if (el.author != undefined) {
				if (el.author == this.user.mail) { count += 1 }
			} else {
				if (entries[prop].author == this.user.mail) { count += 1 }
			}
		}
		this.nbWordsInserted = count
	}

	changeRuleOnAPI(rule) {
		this._httpService.postEntryJSON(this.allUsers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
		.subscribe( res => {
			(rule == AppSettings.RULEADMINISTRATOR ? this.loadingChangeRuleAdministrator = false : (rule == AppSettings.RULEEDITOR ? this.loadingChangeRuleEditor = false : this.loadingChangeRuleLambda = false))
			this.user.group = rule
			this._userservice.currentUser.group = rule
			this._alert.create('success', 'Votre rôle dans la communauté a changé, vous êtes à présent un [' + rule + '] aux yeux des autres membres de la communauté', {duration : 15000})
		})
	}

	sendRequest(rule) {
		let request : Request = new Request(AppSettings.TYPEREQUESTRULE)
		request.user = this.user.mail
		request.timestamp = this._format.getTodayTimestamp()
		request.content = rule
		request.textType = AppSettings.TEXTREQUESTRULE
		this._httpService.postEntryJSON(request, AppSettings.API_REQUESTS, AppSettings.TYPEREQUESTRULE + "-" + this.user.mail, this.user.secretKey)
		.subscribe(
			res => {
				(rule == AppSettings.RULEADMINISTRATOR ? this.loadingChangeRuleAdministrator = false : (rule == AppSettings.RULEEDITOR ? this.loadingChangeRuleEditor = false : this.loadingChangeRuleLambda = false))
				this._alert.create('success', 'La demande de changement de rôle [' + rule + '] a été envoyé avec succès aux autres membres de la communauté et est en cours de traitement', {duration : 15000})
			}
		)
	}

	sendChangeRule(rule) {
		(rule == AppSettings.RULEADMINISTRATOR ? this.loadingChangeRuleAdministrator = true : (rule == AppSettings.RULEEDITOR ? this.loadingChangeRuleEditor = true : this.loadingChangeRuleLambda = true))
		if (this.user.group == AppSettings.RULEADMINISTRATOR) { // No need to send change
			this.allUsers[this.user.mail].group = rule
			this.changeRuleOnAPI(rule)
		} else {
			this.sendRequest(rule)
		}
	}
	
}