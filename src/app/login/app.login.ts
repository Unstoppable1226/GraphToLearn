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

declare var $: any;

@Component({
	selector: 'app-login',
	templateUrl: './app.login.html',
	styleUrls: ['../app.component.css'],
})

export class AppLogin {
	public secretKey
	public mail
	public modal
	public objectConnection
	public objectJoin

	public error
	public errorTextSecretKey

	public errorMail
	public errorTextMail

	public loading
	public loadingButton
	public title


	getReputation(publicKey: string, resp, infoMembers) { // Get the stellar coins of the user => his reputation
		let instance = this;
		this._httpservice.getUserReputation(publicKey)
			.subscribe(function (response) {
				let user = new User();
				user.mail = resp.email;
				user.reputation = !response ? 0 : response;
				user.publicKey = publicKey;
				user.secretKey = instance.secretKey;
				user.group = infoMembers.group;
				user.validated = infoMembers.validated
				instance._httpservice.getEntryJSON(AppSettings.API_SETTINGS)
				.subscribe(
					dataSettings => {
						user.settingsReputation = JSON.parse(dataSettings.dictionary.entries[Object.keys(dataSettings.dictionary.entries)[0]].value)
						instance._userservice.setCurrentUser(user);
						sessionStorage.setItem('currentUser', window.btoa(instance.secretKey));
						instance.loading = false
						instance._router.navigate(['home']);
						instance._alert.create('success', AppSettings.MSGWELCOME + " " + resp.email + " !")
					}
				)
				
			})
	}

	initVariables() {
		this.secretKey = ""
		this.mail = ""
		this.modal
		this.objectConnection = {}
		this.objectJoin = {}
		this.error = false;
		this.errorTextSecretKey = AppSettings.MSG_ERROR_SECRETKEY_EMPTY
		this.errorMail = false;
		this.errorTextMail = AppSettings.MSG_ERROR_MAIL_EMPTY
		this.loading = false
		this.loadingButton = false
		this.title = AppSettings.TITLE
	}

	constructor(private _authservice: AuthService, private _router: Router, private _alert: AlertsService, private _userservice: UserService, private _httpservice: HttpAPIService) {

		let instance = this;
		instance.initVariables();
		instance.objectConnection = {
			closable: true,
			allowMultiple: false,
			observeChanges : true,
			onDeny: function () { return false; },
			onApprove: function () {
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
								instance._httpservice.getEntryJSON(AppSettings.API_MEMBERS)
								.subscribe(
									dataMembers => {
										let dataInfo = JSON.parse(dataMembers.dictionary.entries[Object.keys(dataMembers.dictionary.entries)[0]].value)
										let mail : string = data.email

										if (dataInfo[mail] == undefined) {
											dataInfo[mail] = {
												publicKey: data.publicAddress,
												group: AppSettings.RULELAMBDA,
												validated: false
											}
											instance._httpservice.postEntryJSON(dataInfo, AppSettings.API_MEMBERS, "members", instance.secretKey)
											.subscribe(
												datas => {
													console.log(datas)
												},
												error => { }
											)
										
										} else {
											if (dataInfo[mail].validated == false && dataInfo[mail].refusedBy == undefined) {
												$('#modalConnection').modal('hide');
												instance._alert.create('info', "Votre compte n'a pas encore été accepté par la communauté, votre demande est en attente et sera traitée lorsqu'un membre l'acceptera !", { duration: 25000 })
											} else if (dataInfo[mail].validated == false && dataInfo[mail].refusedBy != undefined) {
												$('#modalConnection').modal('hide');
												instance._alert.create('error', "Votre demande d'accès a été refusée", { duration: 25000 })
												
											} else {
												$('#modalConnection').modal('hide');
												instance.loading = true
												instance.getReputation(data.publicAddress, data, dataInfo[mail])
											}
											
										}

									}
								)
								
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
		instance.objectJoin = {
			closable: true,
			allowMultiple: false,
			onDeny: function () { return false; },
			onApprove: function () {				
				if (instance.mail.length > 0) {
					instance.loadingButton = true
					instance._authservice.join(instance.mail)
						.subscribe(
							data => {
								instance._httpservice.getEntryJSON(AppSettings.API_MEMBERS)
								.subscribe(
									dataMembers => {
										let dataInfo = JSON.parse(dataMembers.dictionary.entries[Object.keys(dataMembers.dictionary.entries)[0]].value)
										let mail : string = instance.mail
					
										if (dataInfo[mail] == undefined) {
											dataInfo[mail] = {
												publicKey: "",
												group: AppSettings.RULELAMBDA,
												validated: false
											}

											instance._httpservice.postEntryJSON(dataInfo, AppSettings.API_MEMBERS, "members", AppSettings.API_KEY)
											.subscribe(
												datas => {
													console.log(datas)
													$('#modalJoinCommunity').modal('hide')
													instance.loadingButton = false
													instance._alert.create('success', AppSettings.MSGMAILSUCCESS, { duration: 15000 })
													return true;
												},
												error => { }
											)
										} else {
											$('#modalJoinCommunity').modal('hide');
											instance.loadingButton = false
											instance._alert.create('success', AppSettings.MSGMAILSUCCESS, { duration: 15000 })
											return true;
										}
									}
								)
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
					console.log(instance.mail)
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

	connect() { $('#modalConnection').modal('show'); }
	join() { $('#modalJoinCommunity').modal('show'); }
}