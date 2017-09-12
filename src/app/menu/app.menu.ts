import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { AuthService } from '../login/app.authservice';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { User } from '../model/user'
import { UserService } from '../model/user-service'
import { HistorySearchService } from '../model/history-search'

declare var $: any;

@Component({
	selector: 'app-menu',
	templateUrl: './app.menu.html',
	styleUrls: ['../app.component.css'],
})

export class MenuComponent {

	public isConnected
	public active
	public user
	public colSearchTerm
	public colKeyWords
	public colModule
	public colOtherTerms
	public historySearch

	constructor(private _httpService: HttpAPIService, private _authservice: AuthService, private _router: Router, private _userservice: UserService, private _historysearch : HistorySearchService) {
		this.user = new User();
		this.initVariables()
		this.user = _userservice.getCurrentUser();
		this.historySearch = _historysearch.getLastSearches()
	}

	initVariables() {
		this.isConnected = false
		this.active = [true, false, false, false]
		this.colSearchTerm = AppSettings.COL_SEARCH_TERM
		this.colKeyWords = AppSettings.COL_KEY_WORDS
		this.colModule = AppSettings.COL_MODULE
		this.colOtherTerms = AppSettings.COL_OTHER_TERMS
		this.historySearch = []
	}


	toggleSideBar() {
		if (this.historySearch.length == 0) {
			this._httpService.getEntryJSON(AppSettings.API_HISTORY)
			.subscribe(
				data => {
					try {
						this._historysearch.lastSearches = JSON.parse(data.dictionary.conf[this._userservice.currentUser.mail])
					} catch (error) {
						this._historysearch.lastSearches = data.dictionary.conf[this._userservice.currentUser.mail]
					}
					
					this.historySearch = this._historysearch.getLastSearches()
					$('.ui.sidebar').sidebar('toggle')
				},
				error => {}
			)
		} else {
			this.historySearch = this._historysearch.getLastSearches()
			$('.ui.sidebar').sidebar('toggle')
		}
		
	}

	ngAfterViewInit() {}

	delete() {
		this._historysearch.lastSearches.splice(0, this._historysearch.lastSearches.length)
		this._httpService.postObservatoryMetadata(this._userservice.currentUser.mail, JSON.stringify(this._historysearch.getLastSearches()), AppSettings.API_HISTORY, this._userservice.currentUser.secretKey)
		.subscribe(function(response){console.log(response);})
	}

	saveOptions() {
		AppSettings.COL_SEARCH_TERM = this.colSearchTerm
		AppSettings.COL_KEY_WORDS =  this.colKeyWords
		AppSettings.COL_MODULE = this.colModule
		AppSettings.COL_OTHER_TERMS = this.colOtherTerms
		$('.ui.modal').modal('hide all')
	}

	searchSelectedWord(word) {
		
		console.log(word)
		$('.ui.sidebar').sidebar('toggle')
		this._router.navigate(['search/' + word]);
	}

	showOptions() {
		$('.ui.options.modal').modal('show')
	}

	showInfo() {
		
	}

	showFeedBack() {

	}

	hideModalOptions() {
		$('.ui.modal').modal('hide all')
	}

	changeActiveMenuItem(id, route) {
		for (var i = this.active.length - 1; i >= 0; i--) { this.active[i] = false; }
		this.active[id] = true;
		this._router.navigate([route]);
	}

	logout() {
		let instance = this;
		$('.ui.mini.modal')
			.modal({
				closable: false,
				onDeny: function () {
					$('.ui.modal').modal('hide all')
					return true;
				},
				onApprove: function () {
					instance._authservice.logout();
				}
			}).modal('show')
	}

}