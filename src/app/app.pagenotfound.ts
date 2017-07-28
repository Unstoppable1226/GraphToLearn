import { Component } from '@angular/core';

@Component({
	selector: 'not-found',
  	template: "<router-outlet></router-outlet><div><img  style='text-align:center' src='/assets/images/404.png' alt='' width='50%' height='50%'/></div>"
})

export class PageNotFoundComponent {}