import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JasperoAlertsModule } from '@jaspero/ng2-alerts';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { RouterModule, Routes } from '@angular/router';
import { HttpModule} from "@angular/http";

import { AppComponent } from './app.component';
import { AppSearch } from './search/app.search';
import { AppInsertion } from './insertion/app.insertion';
import { PageNotFoundComponent } from './app.pagenotfound';

const appRoutes: Routes = [
	{ path: 'rechercher', component: AppSearch },
	{ path: 'search/:id', component: AppSearch },
	{ path: 'insertion', component: AppInsertion },
	{ path: '',
		redirectTo: '/rechercher',
		pathMatch: 'full'
	},
	{ path: '**', component: PageNotFoundComponent }
];

@NgModule({
	declarations: [
		AppComponent,
		AppSearch,
		AppInsertion,
		PageNotFoundComponent,
	],
	imports: [
		RouterModule.forRoot(
			appRoutes,
				{ enableTracing: true,} // <-- debugging purposes only
			),
		BrowserModule,
		HttpModule,
		FormsModule,
		NoopAnimationsModule,
		JasperoAlertsModule,
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
