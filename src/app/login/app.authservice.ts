import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../settings/app.settings';
import { HttpAPIService } from '../api/app.http-service'

declare var $: any;
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

	private isConnected = false

	constructor(private _http: Http, private _router: Router, private _httpservice: HttpAPIService) { }

	connect(secretKey: string) { return this._httpservice.getUser(secretKey) }

	join(mail: string) { return this._httpservice.joinCommunity(mail)  }

	logout() {
		var el = document.getElementsByClassName('ui dimmer modals page transition hidden'); // Remove other modals
		if (el.length > 0) { el[0].children[0].remove(); }
		sessionStorage.removeItem('currentUser');
		this._router.navigate(['welcome']);
	}
}