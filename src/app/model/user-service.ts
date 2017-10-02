import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../settings/app.settings';
import { HttpAPIService } from '../api/app.http-service'
import { User } from './user'

declare var $:any;
import 'rxjs/add/operator/map';

@Injectable()
export class UserService  {

	private isConnected = false
	public currentUser : User

	constructor (private _http: Http, private _router: Router, private _httpservice : HttpAPIService) {}

	connect(secretKey : string) {
		return this._httpservice.getUser(secretKey)
	}

	setCurrentUser(user : User) {
		this.currentUser =  Object.assign({},user);
	}

	getReputation(publicKey : string) { // Get the stellar coins of the user => his reputation
		let instance = this;
		return instance._httpservice.getUserReputation(publicKey)
	}

	getCurrentUser() {
		return new Promise((resolve, reject) => {
			let instance = this;
			if (instance.currentUser == undefined || instance.currentUser.mail == "") {
				instance.currentUser = new User()
				let key
				try {
					key = window.atob(sessionStorage.getItem('currentUser')) // We put here the try and catch because if we dont the method will not catch the exception
				} catch(e) {
					instance._router.navigate(['welcome']);
				}
				instance._httpservice.getUser(key)
				.subscribe(function(response) {
					if (response.email == undefined) {
						instance._router.navigate(['welcome']);
					} else {
						instance.currentUser.mail = response.email;
						instance.currentUser.publicKey = response.publicAddress;
						instance.currentUser.secretKey = key;

						instance._httpservice.getEntryJSON(AppSettings.API_MEMBERS)
						.subscribe(
							dataMembers => {
								let dataInfo = JSON.parse(dataMembers.dictionary.entries[Object.keys(dataMembers.dictionary.entries)[0]].value)
								let mail : string = response.email
								instance.currentUser.group = dataInfo[mail].group
								instance.currentUser.validated = dataInfo[mail].validated
								instance.getReputation(response.publicAddress)
								.subscribe(function(resp){
									instance._httpservice.getEntryJSON(AppSettings.API_SETTINGS)
										.subscribe(
											dataSettings => {
												instance.currentUser.settingsReputation = JSON.parse(dataSettings.dictionary.entries[Object.keys(dataSettings.dictionary.entries)[0]].value)
												instance.currentUser.reputation = !resp ? 0 : resp;
												resolve(instance.currentUser);
											}
										)
									
								})
							}
						)		
					}
				});
			} else {
				resolve(instance.currentUser);
			}
		});
		
	}

	logout() {
		this.currentUser = new User()
		/*var el = document.getElementsByClassName('ui dimmer modals page transition hidden'); // Remove other modals
		if (el.length > 0) {el[0].children[0].remove();}*/
		localStorage.removeItem('currentUser');
		this._router.navigate(['welcome']);
	}
}