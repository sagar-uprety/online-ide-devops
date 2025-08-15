import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {ReplaySubject} from 'rxjs';
import {Router} from '@angular/router';

const LOGIN_PATH = '/login';
const LOGOUT_PATH = '/logout';

@Injectable()
export class AuthService {

    private authenticated$: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

    public get authenticated(): ReplaySubject<boolean> {
        return this.authenticated$;
    }

    constructor(private http: HttpClient,
                private router: Router) {
        this.checkAuthentication();
    }

    public checkAuthentication(): void {
        this.http.get<boolean>('/authenticated')
            .subscribe((authenticated) => {
                this.authenticated$.next(authenticated);
            }, (err) => {
                this.authenticated$.next(false);
            });
    }

    public login(redirectUrl: string = ''): void {
        window.location.href = `${window.location.origin}${LOGIN_PATH}?redirect_url=${redirectUrl}`; // handled by backend
    }

    public logout(): void {
        this.http.post(LOGOUT_PATH, {})
            .subscribe(() => {
                this.router.navigateByUrl('/home');
                this.checkAuthentication();
            });
    }
}
