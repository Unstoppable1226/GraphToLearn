import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { AppSettings } from '../settings/app.settings';

import 'rxjs/add/operator/map';

@Injectable()
export class HttpAPIService  {
	constructor (private _http: Http) {}

	getJSON() {
		return this._http.get(AppSettings.API_TAGS)
			.map((res: Response) => res.json());
	}

	postJSON(dataInfo) {
		let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded', 'Accept' : 'application/json'}); // ... Set content type to JSON
        		let options  = new RequestOptions({ headers: headers });

		return this._http.post(AppSettings.API_OBSERVATORY, "secretKey=SDRSUEUEOJAJJG4MC76F2H7FTGYYTFASNCTMEJ7XJFUHFRQG5M2QI5O3%20&observatoryId=" + dataInfo.name , options)
			.map((res: Response) => res.json());
	}
}
