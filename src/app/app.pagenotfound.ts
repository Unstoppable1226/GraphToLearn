import { Component } from '@angular/core';
import { Router } from '@angular/router'

@Component({
	selector: 'not-found',
  	template: "<div style='text-align:center!important; margin-top:50px!important' ><img   src='/assets/images/404.png' alt='' width='50%' height='50%'/><button style='display:block; margin-top:10px; margin-left: 40%;min-width:250px!important; font-size: 1.2em;' class='ui button large button-home'(click)='backToHome()'> <i class='reply icon'></i> Retour à la page d'accueil <span style='margin-left:8px'>|</span><i class='home icon' style='margin-left:10px'></i></button></div>"
})

export class PageNotFoundComponent {

	constructor(private _router: Router) {}

	backToHome() {this._router.navigate(['/home'])} // Return to home page
}