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
	public loading = false;

	title = AppSettings.TITLE;


	getReputation(publicKey : string, resp) { // Get the stellar coins of the user => his reputation
		let instance = this;
		this._httpservice.getUserReputation(publicKey)
		.subscribe(function(response){
			let user = new User();
			user.mail = resp.email;
			user.reputation = !response ? 0 : response;
			user.publicKey = publicKey;
			instance._userservice.setCurrentUser(user);
			sessionStorage.setItem('currentUser', window.btoa(instance.secretKey));
			instance.loading = false
			instance._router.navigate(['home']);
			instance._alert.create('success', AppSettings.MSGWELCOME + " " + resp.email + " !")
		})
	}
	
	constructor(private _authservice : AuthService, private _router: Router, private _alert: AlertsService, private _userservice : UserService, private _httpservice : HttpAPIService) {
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
							instance.loading = true
							instance.getReputation(resp.publicAddress, resp)
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