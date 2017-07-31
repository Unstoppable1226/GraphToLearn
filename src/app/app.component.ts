import { Component, AfterViewInit } from '@angular/core';
import { AppSettings } from './settings/app.settings';
import { HttpAPIService } from './api/app.http-service';
import { Formatter } from './tools/app.formatter';
import { Manager3D } from './3D/app.components3d';

declare var $:any;

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css'],
	providers: [HttpAPIService, Formatter, Manager3D]
})

export class AppComponent {
	title = AppSettings.TITLE;
}


