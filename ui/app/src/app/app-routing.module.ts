import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IdeComponent} from './ide/ide.component';
import {AuthGuard} from './shared/guards/auth.guard';
import {ProjectsComponent} from './projects/projects.component';
import {HomeComponent} from './home/home.component';


const routes: Routes = [
    {
        path: 'ide/:id', component: IdeComponent, canActivate: [AuthGuard]
    },
    {
        path: 'manage-projects', component: ProjectsComponent, canActivate: [AuthGuard]
    },
    {
        path: 'home', component: HomeComponent
    },
    {
        path: '**', redirectTo: '/manage-projects', pathMatch: 'full'
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
