/* Core */
import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router, CanActivate, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

/* Services */
import { HttpAPIService } from '../api/app.http-service';
import { AuthService } from '../login/app.authservice';

/* Models */
import { User } from '../model/user';
import { UserService } from '../model/user-service';

/* Constants */
import { AppSettings } from '../settings/app.settings';

/* Tools */
import { Formatter } from '../tools/app.formatter';

/* Alerts */
import { AlertsService, AlertType } from '@jaspero/ng2-alerts';

declare var $: any;

@Component({
	selector: 'app-login',
	templateUrl: './app.login.html',
	styleUrls: ['../app.component.css'],
})

export class AppLogin implements OnInit {

	public secretKey : string // Secret Key gaved by the user
	public mail : string // Mail gived for the user

	public error : boolean // Error occured in the modal connection
	public errorTextSecretKey : string // Error that the user commited on modal connection

	public errorMail : boolean // Error occured in the modal join
	public errorTextMail : string // Error taht the user commited on modal join

	public loading : boolean // Loading to indicate when the user must be patient
	public loadingButton : boolean // Loading for the button to indicate when the user must be patient
	public title : string // Title of the application

	constructor(private _authservice: AuthService, private _router: Router, private _alert: AlertsService, private _userservice: UserService, private _httpservice: HttpAPIService,  private _format: Formatter) {
		this._format.deleteAllModals()
	}

	ngOnInit() {
		this.initVariables();
	}

	initVariables() {
		this.secretKey = ""
		this.mail = ""
		this.error = false;
		this.errorTextSecretKey = AppSettings.MSG_ERROR_SECRETKEY_EMPTY
		this.errorMail = false;
		this.errorTextMail = AppSettings.MSG_ERROR_MAIL_EMPTY
		this.loading = false
		this.loadingButton = false
		this.title = AppSettings.TITLE
	}

	constructReputation(publicKey, response, resp, infoMembers) {
		let instance = this, user = new User();
		user.mail = resp.email;
		user.reputation = !response ? 0 : (response == -10000 ? 0 : response);
		user.publicKey = publicKey;
		user.secretKey = instance.secretKey;
		user.group = infoMembers.group;
		user.validated = infoMembers.validated
		if (infoMembers.settingsGeneral != undefined) {user.settingsGeneral = infoMembers.settingsGeneral}
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
	}

	getReputation(publicKey: string, resp, infoMembers) { // Get the stellar coins of the user => his reputation
		let instance = this;
		this._httpservice.getUserReputation(publicKey)
		.subscribe(
			reputation=> {
				if (isNaN(reputation)) {
					this._httpservice.findFriendBot(publicKey)
					.subscribe(
						find => { this.constructReputation(publicKey, 0, resp, infoMembers) }
					)
				} else { this.constructReputation(publicKey, reputation, resp, infoMembers) }
			},
		)
	}

	checkResultConnection(data) {
		this.loadingButton = false
		if (data.publicAddress != undefined) {
			this._httpservice.getEntryJSON(AppSettings.API_MEMBERS)
			.subscribe(
				allMembers => {
					let dataInfo = JSON.parse(allMembers.dictionary.entries[Object.keys(allMembers.dictionary.entries)[0]].value)
					let mail : string = data.email

					if (dataInfo[mail] == undefined) {
						dataInfo[mail] = {
							publicKey: data.publicAddress,
							group: AppSettings.RULELAMBDA,
							validated: false
						}
						this._httpservice.postEntryJSON(dataInfo, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, this.secretKey)
						.subscribe(resultPostMembers => { console.log(resultPostMembers) })
					} else {
						$('.ui.modal').modal('hide');
						if (dataInfo[mail].validated == false && dataInfo[mail].refusedBy == undefined) {
							this._alert.create('info', AppSettings.MSG_USER_WAITS_ACCEPTATION, { duration: 30000 })
						} else if (dataInfo[mail].validated == false && dataInfo[mail].refusedBy != undefined) {
							this._alert.create('error', AppSettings.MSG_USER_REFUSED_BY + dataInfo[mail].refusedBy, { duration: 30000 })
						} else {
							this.loading = true
							this.getReputation(data.publicAddress, data, dataInfo[mail])
						}	
					}
				}
			)
		}
	}

	startConnection() {
		if (this.secretKey.length > 0) { // Not empty
			this.loadingButton = true
			this._authservice.connect(this.secretKey)
			.subscribe(
				data => {
					console.log(data)
					this.checkResultConnection(data)
				},
				err => {
					this.loadingButton = false;
					this.error = true;
					if (err.status == 401) { // User already exists
						this.errorTextSecretKey = AppSettings.MSG_ERROR_LOG_IN
					}
				}
			)
			return false;
		} else { // The information is empty
			this.loadingButton = false
			this.error = true;
			this.errorTextSecretKey = AppSettings.MSG_ERROR_SECRETKEY_EMPTY;
			return false;
		}
	}

	isEmailValid() {
		return this._format.validateEmail(this.mail)
	}

	redirectToHome() {
		$('.ui.modal').modal('hide')
		this.loadingButton = false
		this._alert.create('success', AppSettings.MSGMAILSUCCESS, { duration: 15000 })
	}

	prepareUser() {
		this._httpservice.getUsers()
		.subscribe(
			users => {
				this._httpservice.findFriendBot(users.user_list.list[this.mail])
				.subscribe(
					data => {
						this._httpservice.getEntryJSON(AppSettings.API_MEMBERS)
						.subscribe(
							dataMembers => {
								let dataInfo = JSON.parse(dataMembers.dictionary.entries[Object.keys(dataMembers.dictionary.entries)[0]].value)
								let mail : string = this.mail
		
								if (dataInfo[mail] == undefined) {
									dataInfo[mail] = {
										publicKey: users.user_list.list[this.mail],
										group: AppSettings.RULELAMBDA,
										validated: false
									}
									this._httpservice.postEntryJSON(dataInfo, AppSettings.API_MEMBERS, AppSettings.TAGMEMBERS, AppSettings.API_KEY)
									.subscribe(
										datas => {
											this.redirectToHome()
										},
									)
								} else {
									this.redirectToHome()
								}
							}
						)
					}
				)
			}
		)
	}

	launchRegistration() {
		let isMailNotNull = this.mail.trim().length > 0, isMailValid = this.isEmailValid()
		if (isMailNotNull && isMailValid) {
			this.loadingButton = true
			this._authservice.join(this.mail)
			.subscribe(
				data => { this.prepareUser() },
				err => {
					this.loadingButton = false;
					this.errorMail = true;
					this.errorTextMail = err.status == 409 ? AppSettings.MSG_ERROR_MAIL_TAKEN : AppSettings.MSG_ERROR_CREATE_USER
				}
			)
		} else {
			this.errorMail = true;
			this.errorTextMail = isMailNotNull ? AppSettings.MSG_ERROR_MAIL_INVALID : AppSettings.MSG_ERROR_MAIL_EMPTY;
		}
		return false;
	}

	focusPassword() {
		this.error = false;
		this.errorMail = false;
	}

	connect() { 
		$('#modalConnection').modal('refresh').modal('show');
	}

	join() { 
		$('#modalJoinCommunity').modal('refresh').modal('show');
	}
}