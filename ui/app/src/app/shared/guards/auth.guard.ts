import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {tap} from 'rxjs/operators';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService,
                private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.authenticated
            .pipe(tap(authenticated => {
                if (!authenticated) {
                    // if not authenticated, redirect to home
                    this.router.navigateByUrl('/home');
                }
            }));
    }
}
