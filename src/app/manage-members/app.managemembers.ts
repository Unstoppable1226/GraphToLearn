import { Component, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';

import { Entry } from '../model/entry'
import { User } from '../model/user'
import { Request } from '../model/request'
import { RequestType } from '../model/request-type'
import { UserService } from '../model/user-service';
import { HistorySearchService } from '../model/history-search';

declare var $: any; // This is necessary if you want to use jQuery in the app

@Component({
	selector: 'manage-members',
	templateUrl: './app.managemembers.html',
	styleUrls: ['../app.component.css'],
})

export class AppManagerMembers implements OnInit {

	public user : User
	public numberAdmins : number = 0
	public numberEditors : number = 0
	public numberLambda : number = 0
	public allMembers = {};
	public allMembersArray = [];
	public allRequests = [];
	public newMembers = [];
	public loadingAddMembers = false
	public loadingModifyRule = false

	constructor(private _httpService: HttpAPIService, private _format: Formatter, private _alert: AlertsService, private _userservice: UserService, private _historysearch: HistorySearchService) {
		this._format.deleteAllModals()
	}

	incrementNumber(rule) {
		if (rule == AppSettings.RULEADMINISTRATOR) {
			this.numberAdmins += 1
		} else if (rule == AppSettings.RULEEDITOR) {
			this.numberEditors += 1
		} else {
			this.numberLambda += 1
		}
	}

	getMembers() {
		this._httpService.getEntryJSON(AppSettings.API_MEMBERS)
		.subscribe(
			data => {
				this.allMembers = JSON.parse(data.dictionary.entries[Object.keys(data.dictionary.entries)[0]].value)
				for (let prop in this.allMembers) {
					if (this.allMembers[prop].validated == false && this.allMembers[prop].refusedBy == undefined) {
						this.allMembers[prop].mail = prop
						this.newMembers.push(this.allMembers[prop])
					}
				}
				if (this.user.group == AppSettings.RULEADMINISTRATOR) {
					
					for(let prop in this.allMembers) {
						this.incrementNumber(this.allMembers[prop].group)
						this.allMembersArray.push({mail : prop, group: this.allMembers[prop].group, publicKey: this.allMembers[prop].publicKey, validated : this.allMembers[prop].validated})
					}
					$(document).ready(function() {
						$('#example').DataTable();
					});
				}
			}
		)
	}

	activatePopover(i) {
		$('.ui.popup').popup('hide all');
		$('#modifyRule' + i).popup({
			exclusive: true,
			popup : $('#customRule' + i),
			on    : 'click'
		});
	}

	modifyRule(i, rule) {
		this.loadingModifyRule = true
		this.allMembers[this.allMembersArray[i].mail].group = rule
		
		this._httpService.postEntryJSON(this.allMembers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
		.subscribe(
			data => {
				console.log(data)
				this.loadingModifyRule = false
				$('.ui.popup').popup('hide all');
				this.incrementNumber(rule)
				this.allMembersArray[i].group = rule
			},
			error => {
			}
		)
	}

	addMember(i, all) {
		let member = {
			publicKey: this.newMembers[i].publicKey,
			group: this.newMembers[i].group,
			validated: true,
		}
		this.allMembers[this.newMembers[i].mail] = member

		this._httpService.postEntryJSON(this.allMembers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
			.subscribe(
			data => {
				console.log(data)
				if (i == this.newMembers.length - 1 && all) {
					this.newMembers.splice(0, this.newMembers.length)
					this.loadingAddMembers = false
				}
				if (!all) {
					this.newMembers.splice(i, 1)
				}

			},
			error => {
				this.loadingAddMembers = false;
			}
		)
	}

	acceptAll() {
		this.loadingAddMembers = true
		for (let index = 0; index < this.newMembers.length; index++) {
			this.addMember(index, true)
		}
	}

	refuseMember(i) {
		let member = {
			publicKey: this.newMembers[i].publicKey,
			group: this.newMembers[i].group,
			validated: false,
			refusedBy: this._userservice.currentUser.mail
		}
		this.allMembers[this.newMembers[i].mail] = member

		this._httpService.postEntryJSON(this.allMembers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
			.subscribe(
			data => {
				console.log(data);
				this.newMembers.splice(i, 1)
			}
		)

	}

	ngAfterViewInit() {
		
	}

	acceptRequest(index, request) {
		console.log(request)
		if (request.type == 1) {
			this.allMembers[request.user].group = request.content
			this._httpService.postEntryJSON(this.allMembers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
			.subscribe(
				data => {
					console.log(data);
					request.validatedBy = this._userservice.currentUser.mail
					this._httpService.postEntryJSON(request, AppSettings.API_REQUESTS, AppSettings.TYPEREQUESTRULE + "-" + request.user, this._userservice.currentUser.secretKey)
					.subscribe(
						res => { console.log(res)}
					)
				}
			)
		}
	}

	refuseRequest(index, request) {

	}

	ngOnInit() {
		this.user = new User()
		this._httpService.getEntryJSON(AppSettings.API_REQUESTS)
		.subscribe(
			requests => {
				let entries = requests.dictionary.entries
				for (let prop in entries) {
					let element = JSON.parse(entries[prop].value);
					if (element.type == 1) {
						element.textType = "Changement de rôle"
						element.text = "Ce membre souhaite devenir [" + element.content +"] dans l'outil."
					}
					this.allRequests.push(element)
				}
			}
		)
		if (this._userservice.currentUser == undefined) {
			this._userservice.getCurrentUser().then(
				(user : User) => {this.user = user;this.getMembers()}
			)
		} else {
			this.user = this._userservice.currentUser
			this.getMembers()
		}
	}
}