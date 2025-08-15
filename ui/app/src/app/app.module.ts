import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {en_US, NgZorroAntdModule, NZ_I18N} from 'ng-zorro-antd';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {registerLocaleData} from '@angular/common';
import en from '@angular/common/locales/en';
import {IdeComponent} from './ide/ide.component';
import {SharedModule} from './shared/shared.module';
import {IdeFileListComponent} from './ide/ide-file-list/ide-file-list.component';
import {IdeActionBarComponent} from './ide/ide-action-bar/ide-action-bar.component';
import {IdeConsoleComponent} from './ide/ide-console/ide-console.component';
import {IdeEditorComponent} from './ide/ide-editor/ide-editor.component';
import {MonacoEditorModule} from 'ngx-monaco-editor';
import {ProjectsComponent} from './projects/projects.component';
import {HomeComponent} from './home/home.component';
import {IdeService} from './ide/ide.service';

registerLocaleData(en);

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        IdeComponent,
        IdeFileListComponent,
        IdeActionBarComponent,
        IdeConsoleComponent,
        IdeEditorComponent,
        ProjectsComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgZorroAntdModule,
        BrowserAnimationsModule,
        SharedModule,
        MonacoEditorModule.forRoot()
    ],
    providers: [
        {provide: NZ_I18N, useValue: en_US},
        IdeService
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
