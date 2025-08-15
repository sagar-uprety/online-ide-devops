import {Component, OnDestroy, OnInit} from '@angular/core';
import {CompilerEndpoint, SourceCodeDto, SourceFile, SourceFileEndpoint} from '../../shared/ts-api';
import {IdeService} from '../ide.service';
import {Subscription} from 'rxjs';

@Component({
    selector: 'ide-action-bar',
    templateUrl: './ide-action-bar.component.html',
    styleUrls: ['./ide-action-bar.component.scss']
})
export class IdeActionBarComponent implements OnInit, OnDestroy {
    public currentFile: SourceFile;
    public lastOutput: SourceCodeDto;
    public unsavedState: boolean;

    private currentFileSub: Subscription;
    private lastOutputSub: Subscription;
    private unsavedStateSub: Subscription;

    constructor(private ideService: IdeService,
                private fileEndpoint: SourceFileEndpoint,
                private compilerEndpoint: CompilerEndpoint) {
        this.lastOutputSub = this.ideService.lastOutput$.subscribe((output) => {
            this.lastOutput = output;
        });
        this.currentFileSub = this.ideService.currentFile$.subscribe((file) => {
            this.currentFile = file;
        });
        this.unsavedStateSub = this.ideService.unsavedState$.subscribe((unsavedState) => {
            this.unsavedState = unsavedState;
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.lastOutputSub) {
            this.lastOutputSub.unsubscribe();
        }
        if (this.currentFileSub) {
            this.currentFileSub.unsubscribe();
        }
    }

    public saveFile() {
        this.fileEndpoint.updateFile(this.currentFile.id, this.currentFile)
            .subscribe((file) => {
                this.ideService.getFiles();
                this.ideService.unsavedState$.next(false);
            });
    }

    public compileFile() {
        const sourceCodeDto = new SourceCodeDto();
        sourceCodeDto.code = this.currentFile.code;
        sourceCodeDto.fileName = this.currentFile.fileName;
        this.compilerEndpoint.compile(sourceCodeDto)
            .subscribe((scd) => {
                this.ideService.lastOutput$.next(scd);
            });
    }
}
