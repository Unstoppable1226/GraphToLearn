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

    public lastSearches : string[]

    constructor (private _http: Http, private _router: Router, private _httpservice : HttpAPIService) {}

    getLast15() {
        let length = this.lastSearches.length
        if (length > 15) {
            let array = this.lastSearches.slice(length - 15, length)
            delete(this.lastSearches)
            this.lastSearches = array
        }
    }

    getLastSearches(): string[] {
        this.getLast15()
    	return this.lastSearches
    }

    existantSoUpdate(name) {
        if (name != "" && name != null) {
            if (this.lastSearches == undefined) { this.lastSearches = []}
            let index = this.lastSearches.indexOf(name)
            if (index != -1) { 
                this.lastSearches.splice(index, 1) ;
            }
            this.lastSearches.unshift(name)
        }
    }

    getLastSearchesFromAPI(usermail) : Promise<string[]> {
        return new Promise((resolve, reject) => {
            this._httpservice.getEntryJSON(AppSettings.API_HISTORY)
            .subscribe(
                data => {
                    resolve((data.dictionary.conf[usermail] == "[]" ? [] : data.dictionary.conf[usermail]))
                },
                error => { reject([])}
            )
        })
    }

    saveHistorySearchesOnAPI(usermail, lastSearches, observatory, secretKey) {
        this._httpservice.postObservatoryMetadata(usermail, lastSearches, observatory, secretKey)
        .subscribe(function (response) { console.log(response); })
    }
    
    addSearch(name, usermail, observatory, secretKey) {
        if (this.lastSearches == undefined) {
            this.getLastSearchesFromAPI(usermail).then(
                lastSearchesArray => { 
                    this.lastSearches = lastSearchesArray
                    this.existantSoUpdate(name)
                    this.getLast15()
                    this.saveHistorySearchesOnAPI(usermail, JSON.stringify(this.lastSearches), observatory, secretKey)
                }
            )
        } else {
            if (name != "" && name != null) {
                this.existantSoUpdate(name)
                this.getLast15()
                this.saveHistorySearchesOnAPI(usermail, JSON.stringify(this.lastSearches), observatory, secretKey)
            }
        }
    }

}