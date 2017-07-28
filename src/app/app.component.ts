import { Component, AfterViewInit } from '@angular/core';
import { AppSettings } from './settings/app.settings';
import { HttpAPIService } from './api/app.http-service';
import { Formatter } from './tools/app.formatter';

declare var $:any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [HttpAPIService, Formatter]
})

export class AppComponent {
	title = AppSettings.TITLE;
}


