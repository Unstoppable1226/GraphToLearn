import { AppSettings } from '../settings/app.settings'

export class SettingsGeneral {
    colSearchTerm : string
    colKeyWords : string
	colModule : string
    colOtherTerms : string

    constructor() {
        this.colSearchTerm = AppSettings.COL_SEARCH_TERM;
        this.colKeyWords = AppSettings.COL_KEY_WORDS;
        this.colModule = AppSettings.COL_MODULE;
        this.colOtherTerms = AppSettings.COL_OTHER_TERMS;
    }
}