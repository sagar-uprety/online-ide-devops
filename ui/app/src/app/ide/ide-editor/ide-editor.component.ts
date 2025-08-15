import {Component, OnDestroy, OnInit} from '@angular/core';
import {SourceFile} from '../../shared/ts-api';
import {IdeService} from '../ide.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'ide-editor',
    templateUrl: './ide-editor.component.html',
    styleUrls: ['./ide-editor.component.scss']
})
export class IdeEditorComponent implements OnInit, OnDestroy {

    public editorOptions = {theme: 'vs-light', language: 'java'};
    public editor: any;
    public darkModeEnabled: boolean;

    public currentFile: SourceFile;

    private currentFileSub: Subscription;
    private darkModeSub: Subscription;

    constructor(private ideService: IdeService) {
        this.currentFileSub = this.ideService.currentFile$
            .subscribe((file) => {
                this.currentFile = file;
                this.editorOptions = {
                    ...this.editorOptions,
                    language: !!file ? this.currentFile.fileName.split('.').reverse()[0] : 'java'
                };
            });
        this.darkModeSub = this.ideService.darkModeEnabled$
            .subscribe((darkModeEnabled) => {
                this.darkModeEnabled = darkModeEnabled;
                this.editorOptions = {
                    ...this.editorOptions,
                    theme: this.darkModeEnabled ? 'vs-dark' : 'vs-light'
                };
            });
    }

    ngOnInit() {
        this.ideService.unsavedState$.next(false);
    }

    ngOnDestroy(): void {
        if (this.currentFileSub) {
            this.currentFileSub.unsubscribe();
            this.ideService.unsavedState$.next(false);
        }
        this.darkModeSub.unsubscribe();
    }


    public onInit(editor: any) {
        this.editor = editor;
    }

    public onChange($event: any) {
        this.ideService.unsavedState$.next(true);
    }
}
