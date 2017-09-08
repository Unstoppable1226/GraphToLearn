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
	public mail = ""
	public modal
	public objectConnection = {}
	public objectJoin = {}
	
	public error = false;
	public errorTextSecretKey = AppSettings.MSG_ERROR_SECRETKEY_EMPTY

	public errorMail = false;
	public errorTextMail = AppSettings.MSG_ERROR_MAIL_EMPTY

	public loading = false
	public loadingButton = false
	title = AppSettings.TITLE


	getReputation(publicKey : string, resp) { // Get the stellar coins of the user => his reputation
		let instance = this;
		this._httpservice.getUserReputation(publicKey)
		.subscribe(function(response){
			let user = new User();
			user.mail = resp.email;
			user.reputation = !response ? 0 : response;
			user.publicKey = publicKey;
			user.secretKey = instance.secretKey;
			instance._userservice.setCurrentUser(user);
			sessionStorage.setItem('currentUser', window.btoa(instance.secretKey));
			instance.loading = false
			instance._router.navigate(['home']);
			instance._alert.create('success', AppSettings.MSGWELCOME + " " + resp.email + " !")
		})
	}
	
	constructor(private _authservice : AuthService, private _router: Router, private _alert: AlertsService, private _userservice : UserService, private _httpservice : HttpAPIService) {
		let instance = this;
		this.objectConnection = {
			closable  : true,
			allowMultiple: false,
			onDeny : function(){ return false; },
			onApprove : function() {
				if (instance.secretKey.length > 0) {
					instance.loadingButton = true
					var resp = instance._authservice.connect(instance.secretKey)
					.subscribe(
						data => { 
							console.log(data)
							instance.loadingButton = false
							if (data.publicAddress == undefined) {
								return false;
							} else {
								
								$('#modalConnection').modal('hide');
								instance.loading = true
								instance.getReputation(data.publicAddress, data)
							}
						},
						err => {
							instance.loadingButton = false;
							instance.error = true;
							if (err.status == 401) { // User already exists
								instance.errorTextSecretKey = AppSettings.MSG_ERROR_LOG_IN
							}
						}
					)
					return false;
				} else {
					instance.loadingButton = false
					instance.error = true;
					instance.errorTextSecretKey = AppSettings.MSG_ERROR_SECRETKEY_EMPTY;
					return false;
				}
			}
		}
		this.objectJoin = {
			closable  : true,
			allowMultiple: false,
			onDeny : function(){ return false; },
			onApprove : function() {
				if (instance.mail.length > 0) {
					instance.loadingButton = true
					
					var resp = instance._authservice.join(instance.mail)
					.subscribe(
						data => { 
							$('#modalJoinCommunity').modal('hide');
							instance.loadingButton = false
							instance._alert.create('success', AppSettings.MSGMAILSUCCESS, {duration: 15000})
							return true;
						},
						err => {
							instance.loadingButton = false;
							instance.errorMail = true;
							if (err.status == 409) { // User already exists
								instance.errorTextMail = AppSettings.MSG_ERROR_MAIL_TAKEN
							} else if (err.status == 500) {
								instance.errorTextMail = AppSettings.MSG_ERROR_CREATE_USER
							}
						}
					)
					return false;
				} else {
					instance.errorMail = true;
					instance.errorTextMail = AppSettings.MSG_ERROR_MAIL_EMPTY;
					return false;
				}
			}
		}
	}

	focusPassword() {
		this.error = false;
		this.errorMail = false;
	}

	ngAfterViewInit() {
		$('#modalConnection').modal(this.objectConnection); 
		$('#modalJoinCommunity').modal(this.objectJoin);
	}

	connect() {$('#modalConnection').modal('show');}
	join() {$('#modalJoinCommunity').modal('show');}
}