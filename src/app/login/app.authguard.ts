/* Core */
import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/* Services */
import { HttpAPIService } from '../api/app.http-service'
import { UserService } from '../model/user-service'

/* Constants */
import { AppSettings } from '../settings/app.settings';


@Injectable()
export class AuthGuard implements CanActivate  {

	private isConnected = false // Indicates if the user is connected

	constructor (private router: Router, private _userservice : UserService, private _httpservice : HttpAPIService) {}

	goLoginPage() {
		this.router.navigate(['welcome']);
		return false
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		if (this._userservice.currentUser == undefined) {
			if (sessionStorage.getItem(AppSettings.CURRENTUSER)) { // Logged in so return true
				try {
					let key = window.atob(sessionStorage.getItem(AppSettings.CURRENTUSER))
					this._httpservice.getUser(key).subscribe(
						user => { return true; }
					)
				} catch(e) { return this.goLoginPage() }
			} else { return this.goLoginPage() }
		}
		return true
	}
}