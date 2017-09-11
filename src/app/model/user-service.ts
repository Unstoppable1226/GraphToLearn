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
		let instance = this;
		console.log(this.currentUser);
		if (this.currentUser == undefined) {
			this.currentUser = new User()
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
					instance.getReputation(response.publicAddress)
					.subscribe(function(resp){
						instance.currentUser.reputation = !resp ? 0 : resp;
						return instance.currentUser;
					})
				}
			});
		} else {
			return instance.currentUser;
		}
	}

	logout() {
		var el = document.getElementsByClassName('ui dimmer modals page transition hidden'); // Remove other modals
		if (el.length > 0) {el[0].children[0].remove();}
		localStorage.removeItem('currentUser');
		this._router.navigate(['welcome']);
	}
}