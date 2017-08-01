import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../settings/app.settings';

declare var $:any;
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService  {

	private isConnected = false

	constructor (private _http: Http, private _router: Router) {}

	connect(secretkey : string) {
		localStorage.setItem('currentUser', JSON.stringify(secretkey));
		this._router.navigate(['home']);
		/*
		return this.http.post('/api/authenticate', JSON.stringify({ username: username, password: password }))
            		.map((response: Response) => {
                		// login successful if there's a jwt token in the response
               		let user = response.json();
                	if (user && user.token) {
                    		// store user details and jwt token in local storage to keep user logged in between page refreshes
                    		localStorage.setItem('currentUser', JSON.stringify(user));
                	}
            	});*/
    	}

    	logout() {
    		var el = document.getElementsByClassName('ui dimmer modals page transition hidden'); // Remove other modals
		if (el.length > 0) {el[0].children[0].remove();}
        	localStorage.removeItem('currentUser');
        	this._router.navigate(['welcome']);
   	}
}