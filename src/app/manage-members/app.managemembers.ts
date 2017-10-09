import { Component, AfterViewInit } from '@angular/core';
import { OnInit } from '@angular/core';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';

import { Entry } from '../model/entry'
import { UserService } from '../model/user-service';
import { HistorySearchService } from '../model/history-search';

declare var $:any; // This is necessary if you want to use jQuery in the app

@Component({
	selector: 'manage-members',
    templateUrl: './app.managemembers.html',
    styleUrls: ['../app.component.css'],
})

export class AppManagerMembers implements OnInit {
	public allMembers = {};
	public newMembers = [];
	public loadingAddMembers = false

	constructor(private _httpService : HttpAPIService, private _format: Formatter, private _alert: AlertsService, private _userservice : UserService, private _historysearch : HistorySearchService) {
		this._format.deleteAllModals()
	}

	getMembers() {
		this._httpService.getEntryJSON(AppSettings.API_MEMBERS)
		.subscribe(
			data=> {
				this.allMembers = JSON.parse(data.dictionary.entries[Object.keys(data.dictionary.entries)[0]].value)
				for (let prop in this.allMembers) {
					if (this.allMembers[prop].validated == false && this.allMembers[prop].refusedBy == undefined) {
						this.allMembers[prop].mail = prop
						this.newMembers.push(this.allMembers[prop])
					}
				}
			}
		)
	}

	addMember(i, all) {
		let member = {
			publicKey : this.newMembers[i].publicKey,
			group : this.newMembers[i].group,
			validated : true,
		}
		this.allMembers[this.newMembers[i].mail] = member

		this._httpService.postEntryJSON(this.allMembers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
		.subscribe(
			data=> {
				console.log(data)
				if (i == this.newMembers.length-1 && all) {
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
			publicKey : this.newMembers[i].publicKey,
			group : this.newMembers[i].group,
			validated : false,
			refusedBy : this._userservice.currentUser.mail
		}
		this.allMembers[this.newMembers[i].mail] = member
		
		this._httpService.postEntryJSON(this.allMembers, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this._userservice.currentUser.secretKey)
			.subscribe(
				data=> {
					console.log(data);
					this.newMembers.splice(i, 1)
				}
			)
			
	}

	ngOnInit() {
		this._userservice.getCurrentUser()
		this.getMembers()
	}
}