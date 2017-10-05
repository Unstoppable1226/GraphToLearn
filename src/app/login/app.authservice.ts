import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { HttpAPIService } from '../api/app.http-service'

declare var $: any;
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

	private isConnected = false

	constructor(private _http: Http, private _router: Router, private _format : Formatter, private _httpservice: HttpAPIService) { }

	connect(secretKey: string) { return this._httpservice.getUser(secretKey) }

	join(mail: string) { return this._httpservice.joinCommunity(mail)  }

	logout() {
		sessionStorage.removeItem('currentUser');
		this._router.navigate(['welcome']);
	}
}