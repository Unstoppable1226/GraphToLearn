import { Injectable } from "@angular/core";
import { Http, Response,  Headers, RequestOptions } from "@angular/http";
import { AppSettings } from '../settings/app.settings';
import { HttpAPIService } from '../api/app.http-service'

@Injectable()
export class WordsService  {

    public words : any = null
    public modules : any = null
    public users : any = null

    constructor (private _httpservice : HttpAPIService) {}
    
    getWords() {
        this._httpservice.getEntryJSON(AppSettings.API_WORDS)
        .subscribe(
            response => {
                this.words = response
            }
        )
    }

    getUsers() {
        this._httpservice.getUsers()
        .subscribe(
            response => {
                this.users = response
            }
        )
    }

    getModules() {
        this._httpservice.getEntryJSON(AppSettings.API_MODULES)
        .subscribe(
            response => {
                this.modules = response
            }
        )
    }
}