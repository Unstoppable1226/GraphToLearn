/* Modules */
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JasperoAlertsModule } from '@jaspero/ng2-alerts';
import { TagInputModule } from 'ngx-chips';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { HttpModule} from "@angular/http";

/* Components*/
import { AppComponent } from './app.component';
import { AppHome } from './home/app.home';
import { AppLogin } from './login/app.login';
import { AppSearch } from './search/app.search';
import { AppInsertion } from './insertion/app.insertion';
import { AppManagerMembers } from './manage-members/app.managemembers';
import { AppProfile } from './profile/app.profile';
import { MenuComponent } from './menu/app.menu';
import { PageNotFoundComponent } from './app.pagenotfound';


/* Pipes */
import { RoundPipe } from './tools/round-pipe'
/* Constants*/
import { routing } from './app.routing';

/* Services */ 
import { AppSettings } from './settings/app.settings';
import { HttpAPIService } from './api/app.http-service';
import { Formatter } from './tools/app.formatter';
import { Manager3D } from './3D/app.components3d';
import { AuthGuard } from './login/app.authguard';
import { AuthService } from './login/app.authservice';
import { UserService } from './model/user-service';
import { HistorySearchService } from './model/history-search';
import { WordsService } from './model/words-service'

@NgModule({
	declarations: [
		AppComponent,
		AppHome,
		AppLogin,
		AppSearch,
		AppInsertion,
		RoundPipe,
		AppManagerMembers,
		AppProfile,
		MenuComponent,
		PageNotFoundComponent,
	],
	imports: [
		routing,
		BrowserModule,
		HttpModule,
		FormsModule,
		TagInputModule,
		NoopAnimationsModule,
		JasperoAlertsModule,
	],
	providers: [
		HttpAPIService, 
		Formatter, 
		Manager3D, 
		AuthGuard,
		AuthService,
		UserService,
		HistorySearchService,
		WordsService
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
