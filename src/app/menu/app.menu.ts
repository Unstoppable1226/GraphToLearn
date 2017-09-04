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

declare var $: any;

@Component({
	selector: 'app-menu',
	templateUrl: './app.menu.html',
	styleUrls: ['../app.component.css'],
})

export class MenuComponent {

	public isConnected = false
	public active = [true, false, false, false]
	public user: User

	constructor(private _httpService: HttpAPIService, private _authservice: AuthService, private _router: Router, private _userservice: UserService) {
		this.user = new User();
		this.user = _userservice.getCurrentUser();


		/*let instance = this;
		if (instance._userservice.getCurrentUser() == null) {
			instance.user = new User()
			let key
			try {
    				key = window.atob(sessionStorage.getItem('currentUser')) // We put here the try and catch because if we dont the method will not catch the exception
			} catch(e) {
			    	instance._router.navigate(['welcome']);
			}
			_httpService.getUser(key)
				.subscribe(function(response) {
					if (response.email == undefined) {
						instance._router.navigate(['welcome']);
					} else {
						instance.user.mail = response.email;
						instance.user.publicKey = response.publicAddress;
						instance.getReputation(response.publicAddress)
					}
				});
		} else {
			instance.user = instance._userservice.getCurrentUser();
		}*/
	}



	logout() {
		let instance = this;
		$('.ui.mini.modal')
			.modal({
				closable: false,
				onDeny: function () {
					return true;
				},
				onApprove: function () {
					instance._authservice.logout();
				}
			}).modal('show')
	}

	changeActive(id, route) {
		for (var i = this.active.length - 1; i >= 0; i--) { this.active[i] = false; }
		this.active[id] = true;
		this._router.navigate([route]);
	}

}