import { Component, AfterViewInit } from '@angular/core';
import { AppSettings } from './settings/app.settings';
import { AuthGuard } from './login/app.authguard';
import { UserService } from './model/user-service';
import { HistorySearchService } from './model/history-search';
import { WordsService } from './model/words-service';

declare var $:any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
})

export class AppComponent {
	title = AppSettings.TITLE;

	constructor(protected _authguard : AuthGuard, public _userservice: UserService, public _historysearch : HistorySearchService, public _wordsservice : WordsService) {}
}