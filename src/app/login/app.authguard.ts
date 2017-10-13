/* Core */
import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/* Constants */
import { AppSettings } from '../settings/app.settings';


@Injectable()
export class AuthGuard implements CanActivate  {

	private isConnected = false // Indicates if the user is connected

	constructor (private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		let result = false, key = "";
	 	if (sessionStorage.getItem(AppSettings.CURRENTUSER)) { // Logged in so return true
			try {
				key = window.atob(sessionStorage.getItem(AppSettings.CURRENTUSER))
				return true // He is connected
			} catch(e) {}
		}
		this.router.navigate(['welcome']);
		return false
	}
}