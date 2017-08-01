import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { AuthService } from '../login/app.authservice';
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { User } from '../model/user';
import { UserService } from '../model/user-service';
declare var $:any;

@Component({
	selector: 'app-login',
	templateUrl: './app.login.html',
	styleUrls: ['../app.component.css'],
})

export class AppLogin {
	public secretKey = ""
	public modal
	public object = {}

	title = AppSettings.TITLE;
	
	constructor(private _authservice : AuthService, private _router: Router, private _alert: AlertsService, private _userservice : UserService) {
		let instance = this;
		this.object = {
			closable  : true,
			allowMultiple: false,
			onDeny : function(){ return false; },
			onApprove : function() {
				if (instance.secretKey.length > 0) {
					var resp = instance._authservice.connect(instance.secretKey)
					.subscribe(function(resp){
						if (resp.publicAddress == undefined) {
							return false;
						} else {
							$('#modalConnection').modal('hide');
							let user = new User();
							user.mail = resp.email;
							user.reputation = 6;
							user.publicKey = resp.publicKey;
							instance._userservice.setCurrentUser(user);
							sessionStorage.setItem('currentUser', window.btoa(resp.publicAddress));
							instance._router.navigate(['home']);
							instance._alert.create('success', AppSettings.MSGWELCOME + " " + resp.email + " !")
						}
					})
					return false;
				} else {
					alert("Renseigner le champ")
					return false;
				}
			}
		}
	}
	ngAfterViewInit() {$('#modalConnection').modal(this.object)}
	connect() {$('#modalConnection').modal('show');}
}