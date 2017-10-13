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

    public lastSearches = []

    constructor (private _http: Http, private _router: Router, private _httpservice : HttpAPIService) {
        this.lastSearches = []
    }

    getLast15() {
        if (this.lastSearches.length > 15) {
            this.lastSearches = this.lastSearches.slice(this.lastSearches.length - 15, this.lastSearches.length)
        }
    }

    getLastSearches() {
        this.getLast15()
    	return this.lastSearches
    }

    existantSoUpdate(name) {
        if (name != "" && name != null) {
            if (this.lastSearches.includes(name)) {
                this.lastSearches.splice(this.lastSearches.indexOf(name), 1)
            }
            this.lastSearches.push(name)
        }
    }
    
    addSearch(name) {
        if (this.lastSearches == undefined) {
            this.lastSearches = []
        }
        if (name != "" && name != null) {
            this.lastSearches.push(name)
            this.getLast15()
        }
    }

}