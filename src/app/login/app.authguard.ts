import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../settings/app.settings';

import 'rxjs/add/operator/map';

@Injectable()
export class AuthGuard implements CanActivate  {

	private isConnected = false

	constructor (private _http: Http, private router: Router) {}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		console.log(localStorage);
	        if (localStorage.getItem('currentUser')) {
	            // logged in so return true
	            	return true;
	        }
	        console.log(localStorage);
	        // not logged in so redirect to login page with the return url
	        this.router.navigate(['welcome'], { queryParams: { returnUrl: state.url }});
	        return false;
    	}
}