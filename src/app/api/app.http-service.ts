import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { AppSettings } from '../settings/app.settings';

import 'rxjs/add/operator/map';

@Injectable()
export class HttpAPIService  {
	constructor (private _http: Http) {}

	getTagsJSON() {
		return this._http.get(AppSettings.API_TAGS)
			.map((res: Response) => res.json());
	}

	getUser(secretKey) {
		return this._http.get(AppSettings.API_USERS + "?secretKey=" + secretKey)
			.map((res: Response) => res.json());
	}

	getInfosOnWiki(search) {
		return this._http.get(AppSettings.API_WIKI + "action=opensearch&search="+ search +"&limit=3&format=json")
			.map((res: Response) => res.json())
	}

	getUserReputation(pubKey) {
		return this._http.get(AppSettings.API_USERS + "/balance?public=" + pubKey)
			.map((res: Response) => res.json());
	}

	getEntryJSON(observatory) {
		return this._http.get(AppSettings.API_OBSERVATORY + "?observatoryId=" + observatory)
			.map((res: Response) => res.json());
	}

	postEntryJSON(dataInfo, observatory, tags) {
		let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded', 'Accept' : 'application/json'}); // ... Set content type to JSON
     		let options  = new RequestOptions({ headers: headers });

		return this._http.post(AppSettings.API_ENTRY, "secretKey=SDRSUEUEOJAJJG4MC76F2H7FTGYYTFASNCTMEJ7XJFUHFRQG5M2QI5O3%20&observatoryId=" + observatory + "&tags= " + tags + "&value= " + JSON.stringify(dataInfo), options)
			.map((res: Response) => res.json());
	}
	
	postEntryMetadata(name, value, hashEntry) {
		let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded', 'Accept' : 'application/json'}); // ... Set content type to JSON
		let options  = new RequestOptions({ headers: headers });
		return this._http.post(AppSettings.API_ENTRYMETADATA + "metadata%20name=" + name + "&metadata%20value=" + value, "secretKey=SDRSUEUEOJAJJG4MC76F2H7FTGYYTFASNCTMEJ7XJFUHFRQG5M2QI5O3&observatoryId=Words&hash=" + hashEntry, options)
			.map((res: Response) => res.json());
	}
}
