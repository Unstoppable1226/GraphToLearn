import { Component, AfterViewInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { ActivatedRoute } from '@angular/router';
import { HttpAPIService } from '../api/app.http-service';
import { AppSettings } from '../settings/app.settings';
import { Formatter } from '../tools/app.formatter';
import { AuthService } from '../login/app.authservice';
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
	
	constructor(private _authservice : AuthService) {
		let instance = this;
		this.object = {
			closable  : true,
			allowMultiple: false,
			onDeny : function(){ return false; },
			onApprove : function() {
				if (instance.secretKey.length > 0) {
					instance._authservice.connect(instance.secretKey);
				} else {
					alert("Renseigner le champ")
					return false;
				}
			}
		}
	}

	ngAfterViewInit() {
		$('#modalConnection').modal(this.object)
	}

	connect() {
		
		$('#modalConnection').modal('show');
	}
}