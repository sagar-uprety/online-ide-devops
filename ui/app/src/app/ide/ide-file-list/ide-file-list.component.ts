import {Component, OnDestroy, OnInit} from '@angular/core';
import {GitlabUser, Project, ProjectEndpoint, SourceFile, SourceFileEndpoint} from '../../shared/ts-api';
import {IdeService} from '../ide.service';
import {Subscription} from 'rxjs';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd';

@Component({
    selector: 'ide-file-list',
    templateUrl: './ide-file-list.component.html',
    styleUrls: ['./ide-file-list.component.scss']
})
export class IdeFileListComponent implements OnInit, OnDestroy {

    public files: SourceFile[];
    public currentProject: Project;
    public currentFile: SourceFile;
    public contextMenuFile: SourceFile;

    // modals
    public newFileName = '';
    public newFileIsVisible: boolean;
    public newUsername = '';
    public shareIsVisible: boolean;
    public updateFileIsVisible: boolean;

    // subs
    private filesSub: Subscription;
    private currentProjectSub: Subscription;
    private currentFileSub: Subscription;

    constructor(private ideService: IdeService,
                private projectEndpoint: ProjectEndpoint,
                private fileEndpoint: SourceFileEndpoint,
                private nzContextMenuService: NzContextMenuService) {
        this.filesSub = this.ideService.files$.subscribe((files) => {
            this.files = files;
        });
        this.currentProjectSub = this.ideService.currentProject$.subscribe((project) => {
            this.currentProject = project;
        });
        this.currentFileSub = this.ideService.currentFile$.subscribe((file) => {
            this.currentFile = file;
        });
    }

    ngOnInit() {
    }

    ngOnDestroy() {
        if (this.filesSub) {
            this.filesSub.unsubscribe();
        }
        if (this.currentProjectSub) {
            this.currentProjectSub.unsubscribe();
        }
        if (this.currentFileSub) {
            this.currentFileSub.unsubscribe();
        }
    }

    public createFile() {
        if (!!this.newFileName) {
            const sourceFile: SourceFile = new SourceFile();
            sourceFile.fileName = this.newFileName;
            sourceFile.code = '';
            this.projectEndpoint.addFileToProject(this.currentProject.id, sourceFile)
                .subscribe((file) => {
                    this.ideService.getFiles();
                    this.newFileName = '';
                    this.newFileIsVisible = false;
                });
        }
    }

    public shareProject() {
        if (!!this.newUsername) {
            const user: GitlabUser = new GitlabUser();
            user.username = this.newUsername;
            this.projectEndpoint.shareProjectWithUser(this.currentProject.id, user)
                .subscribe((project) => {
                    this.ideService.getProject(this.currentProject.id, false);
                    this.shareIsVisible = false;
                    this.newUsername = '';
                });
        }
    }

    public selectCurrentFile(file: SourceFile) {
        this.ideService.currentFile$.next(file);
    }

    public contextMenu($event: MouseEvent, menu: NzDropdownMenuComponent, file: SourceFile): void {
        this.contextMenuFile = file;
        this.nzContextMenuService.create($event, menu);
    }

    public updateFile() {
        this.fileEndpoint.updateFile(this.contextMenuFile.id, this.contextMenuFile).subscribe((file) => {
            this.ideService.getFiles();
            this.updateFileIsVisible = false;
            if (this.contextMenuFile.id === this.currentFile.id) {
                this.ideService.currentFile$.next(file);
            }
            this.contextMenuFile = null;
        });
    }

    public deleteFile() {
        this.fileEndpoint.deleteFile(this.contextMenuFile.id)
            .subscribe((file) => {
                this.ideService.getFiles();
                if (this.contextMenuFile.id === this.currentFile.id) {
                    this.ideService.currentFile$.next(null);
                }
                this.contextMenuFile = null;
            });
    }
}
