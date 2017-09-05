import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AppSettings } from '../settings/app.settings';
import { HttpAPIService } from '../api/app.http-service'
import { User } from './user'

declare var $:any;
import 'rxjs/add/operator/map';

@Injectable()
export class HistorySearchService  {

    public lastSearches : Array<string> = []

    constructor (private _http: Http, private _router: Router, private _httpservice : HttpAPIService) {}

    getLastSearches() {
		return this.lastSearches
    }
    
    addSearch(name) {
        this.lastSearches.push(name)
    }

}