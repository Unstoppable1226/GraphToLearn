import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { AppHome } from './home/app.home';
import { AppLogin } from './login/app.login';
import { AppSearch } from './search/app.search';
import { AppInsertion } from './insertion/app.insertion';
import { AppManagerMembers } from './manage-members/app.managemembers';
import { AppProfile } from './profile/app.profile'
import { PageNotFoundComponent } from './app.pagenotfound';
import { AuthGuard } from './login/app.authguard';

const appRoutes: Routes = [
	{ path: 'home', component: AppHome, canActivate: [AuthGuard]},
	{ path: 'welcome', component: AppLogin},
	{ path: 'search/:id', component: AppSearch, canActivate: [AuthGuard]},
	{ path: 'insertion', component: AppInsertion, canActivate: [AuthGuard]},
	{ path: 'manage-members', component: AppManagerMembers, canActivate: [AuthGuard]},
	{ path: 'profile', component: AppProfile, canActivate: [AuthGuard]},
	{ path: '',
		redirectTo: '/home',
		pathMatch: 'full'
	},
	{ path: '**', component: PageNotFoundComponent }
];

export const routing = RouterModule.forRoot(appRoutes);