import { Routes } from '@angular/router';
import { BadgeComponent } from './badge/badge.component';



export const ComponentsRoutes: Routes = [
	{
		path: '',
		children: [

			{
				path: 'badges',
				component: BadgeComponent
			}
		]
	}
];
