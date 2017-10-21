/* Core */
import { Injectable } from "@angular/core";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Http, Response, Headers, RequestOptions } from "@angular/http";
/* Services */
import { HttpAPIService } from '../api/app.http-service'

/* Constants */
import { AppSettings } from '../settings/app.settings';

/* Tools */
import { Formatter } from '../tools/app.formatter';

declare var $: any;
import 'rxjs/add/operator/map';

@Injectable()
export class AuthService {

	private isConnected = false

	constructor(private _http: Http, private _router: Router, private _format : Formatter, private _httpservice: HttpAPIService) { }

	connect(secretKey: string) { return this._httpservice.getUser(secretKey) }

	join(mail: string) { return this._httpservice.joinCommunity(mail)  }

	logout() {
		sessionStorage.removeItem(AppSettings.CURRENTUSER);
		this._router.navigate(['welcome']);
	}
}

