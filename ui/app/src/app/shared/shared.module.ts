import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {AuthGuard} from './guards/auth.guard';
import {AuthService} from './services/auth.service';
import {ApinaModule} from './ts-api';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ApinaModule
    ],
    exports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        ApinaModule
    ],
    declarations: [],
    providers: [
        AuthGuard,
        AuthService
    ],
})
export class SharedModule {
}
