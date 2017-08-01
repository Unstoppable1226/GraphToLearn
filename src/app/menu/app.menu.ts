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

declare var $:any;

@Component({
	selector: 'app-menu',
	templateUrl: './app.menu.html',
	styleUrls: ['../app.component.css'],
})

export class MenuComponent {

	public isConnected = false
	public active = [true, false, false, false]
	public user : User
	
	constructor(private _httpService : HttpAPIService, private _authservice : AuthService, private _router : Router, private _userservice : UserService) {
		
		if (this._userservice.getCurrentUser() == undefined) {
			
		} else {
			this.user = this._userservice.getCurrentUser();
		}
	}

	logout() {
		this._authservice.logout();
	}

	changeActive(id, route) {
		for (var i = this.active.length - 1; i >= 0; i--) {this.active[i] = false;}
		this.active[id] = true;
		this._router.navigate([route]);
	}

}