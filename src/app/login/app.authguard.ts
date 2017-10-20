/* Core */
import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/* Services */
import { HttpAPIService } from '../api/app.http-service'

/* Constants */
import { AppSettings } from '../settings/app.settings';


@Injectable()
export class AuthGuard implements CanActivate  {

	private isConnected = false // Indicates if the user is connected

	constructor (private router: Router, private _httpservice : HttpAPIService) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		let key = "";
		return true
		/*
	 	if (sessionStorage.getItem(AppSettings.CURRENTUSER)) { // Logged in so return true
			try {
				
				key = window.atob(sessionStorage.getItem(AppSettings.CURRENTUSER))
				return true
			} catch(e) {}
		}
		this.router.navigate(['welcome']);
		return false*/
	}
}