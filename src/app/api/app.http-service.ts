import { Injectable } from "@angular/core";
import { Http, Response, Headers, RequestOptions } from "@angular/http";
import { AppSettings } from '../settings/app.settings';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/delay';

@Injectable()
export class HttpAPIService {
	constructor(private _http: Http) { }

	getTagsJSON() {
		return this._http.get(AppSettings.API_TAGS)
			.map((res: Response) => res.json());
	}

	getUser(secretKey) {
		return this._http.get(AppSettings.API_USERS + "?secretKey=" + secretKey)
			.map((res: Response) => res.json());
	}

	getUsers() {
		return this._http.get(AppSettings.API_USERS + "s")
			.map((res: Response) => res.json());
	}

	joinCommunity(mail) {
		let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers });
		return this._http.post(AppSettings.API_USERS + "?email=" + mail, "", options)
		.map((res: Response) => {
			return res
		})
	}

	getInfosOnWiki(search) {
		return this._http.get(AppSettings.API_WIKI + "action=opensearch&search=" + search + "&srprop&" + "&limit=3&format=json")
		.map((res: Response) => res.json())
	}

	getRevisionsOnWiki(search) {
		return this._http.get(AppSettings.API_WIKI + "action=query&prop=revisions&titles=" + search + "&format=json")
		.map((res: Response) => res.json())
	}

	getUserReputation(pubKey) {
		return this._http.get(AppSettings.API_USERS + "/balance?public=" + pubKey)
			.map((res: Response) => res.json())
			.retryWhen(error => error.delay(1000));
	}

	getUserReputationPromise(pubKey) {
		return this._http.get(AppSettings.API_USERS + "/balance?public=" + pubKey)
	}

	getEntryJSON(observatory) {
		return this._http.get(AppSettings.API_OBSERVATORY + "?observatoryId=" + observatory)
			.map((res: Response) => res.json())
			.retryWhen(error => error.delay(1000));
	}

	postEntryJSON(dataInfo, observatory, tags, secretKey) {
		let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers});

		return this._http.post(AppSettings.API_ENTRY, "secretKey=" + secretKey + "&observatoryId=" + observatory + "&tags= " + tags + "&value= " + JSON.stringify(dataInfo), options)
			.map((res: Response) => res.json());
	}

	putEntryJSON(dataInfo, observatory, hash, secretKey) {
		let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers});

		return this._http.put(AppSettings.API_ENTRY, "secretKey=" + secretKey + "&observatoryId=" + observatory + "&hash= " + hash + "&newValue= " + JSON.stringify(dataInfo), options)
			.map((res: Response) => res.json());
	}

	postBalance(publicKeySender, secretKeySender, publicKeyDestination, amount) {
		let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers });
		return this._http.post(AppSettings.API_TRANSFER + "public=" + publicKeySender+ "&secretKey=" + secretKeySender + "&destination=" + publicKeyDestination + "&amount= " + amount," ", options)
		.map((res: Response) => res.json());
	}

	findFriendBot(pubKey) {
		return this._http.get(AppSettings.API_STELLAR_FRIENDBOT + pubKey)
		.map((res: Response) => res.json());
	}

	postObservatoryMetadata(name, value, idObservatory, secretKey) {
		let headers = new Headers({'Content-Type' : 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers});
		return this._http.post(AppSettings.API_OBSERVATORYMETADATA  + "secretKey=" + secretKey + "&observatoryId=" + idObservatory + "&metadata%20name=" + name + "&metadata%20value=" + value, " ", options)
			.map((res: Response) => res);
	}

	postEntryMetadata(name, value, hashEntry, secretKey) {
		let headers = new Headers({'Content-Type' : 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers});
		return this._http.post(AppSettings.API_ENTRYMETADATA + "metadata%20name=" + name + "&metadata%20value=" + value, "secretKey=" + secretKey + "&observatoryId=Words&hash=" + hashEntry, options)
			.map((res: Response) => res);
	}

	deleteEntryJSON(secretKey, observatoryId, hash) {
		let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers, body : "secretKey=" + secretKey + "&observatoryId=" + observatoryId + "&hash=" + hash});
		return this._http.delete(AppSettings.API_ENTRY, options)
	}

	deleteEntryJSONSub(secretKey, observatoryId, hash) {
		let headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' }); // ... Set content type to JSON
		let options = new RequestOptions({ headers: headers, body : "secretKey=" + secretKey + "&observatoryId=" + observatoryId + "&hash=" + hash});
		return this._http.delete(AppSettings.API_ENTRY, options)
			.map((res:Response) => res);
	}
}
