import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { HttpAPIService } from '../api/app.http-service';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../settings/app.settings';
import { User } from '../model/user';
import { UserService } from '../model/user-service';

import 'rxjs/add/operator/map';

@Injectable()
export class AuthGuard implements CanActivate  {

	private isConnected = false

	constructor (private _http: Http, private router: Router, private _httpservice : HttpAPIService, private _userservice : UserService) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
	    let instance = this
		let result = false
	 	if (sessionStorage.getItem('currentUser')) {
			// logged in so return true
			let key
			try {
				key = window.atob(sessionStorage.getItem('currentUser'))
				return true
			} catch(e) {}
		}
		instance.router.navigate(['welcome']);
		return false
	}
}