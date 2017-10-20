import { AppSettings } from '../settings/app.settings'

export class SettingsGeneral {
    colSearchTerm : string
    colKeyWords : string
	colModule : string
    colOtherTerms : string
    rule1 : {isActive : boolean, coefficient : number}
    rule2 : {isActive : boolean, coefficient : number}
    rule3 : {isActive : boolean, coefficient : number}
    rule4 : {isActive : boolean, coefficient : number}
    rule5 : {isActive : boolean, coefficient : number}
    rule6 : {isActive : boolean, coefficient : number}

    constructor() {
        this.colSearchTerm = AppSettings.COL_SEARCH_TERM;
        this.colKeyWords = AppSettings.COL_KEY_WORDS;
        this.colModule = AppSettings.COL_MODULE;
        this.colOtherTerms = AppSettings.COL_OTHER_TERMS;
        this.rule1 = {isActive : true, coefficient: AppSettings.COEFRULES[0]}
        this.rule2 = {isActive : true, coefficient: AppSettings.COEFRULES[1]}
        this.rule3 = {isActive : true, coefficient: AppSettings.COEFRULES[2]}
        this.rule4 = {isActive : true, coefficient: AppSettings.COEFRULES[3]}
        this.rule5 = {isActive : true, coefficient: AppSettings.COEFRULES[4]} 
        this.rule6 = {isActive : true, coefficient: AppSettings.COEFRULES[5]}
    }
}