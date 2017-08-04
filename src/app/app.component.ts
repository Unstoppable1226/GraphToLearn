import { Component, AfterViewInit } from '@angular/core';
import { AppSettings } from './settings/app.settings';
import { AuthGuard } from './login/app.authguard';
import { UserService } from './model/user-service';

declare var $:any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [UserService]
})

export class AppComponent {
	title = AppSettings.TITLE;

	constructor(private _authguard : AuthGuard, private _userservice: UserService) {}
}