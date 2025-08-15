import {Component, OnDestroy, OnInit} from '@angular/core';
import {Project, SourceCodeDto, SourceFile} from '../shared/ts-api';
import {Subscription} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../shared/services/auth.service';
import {IdeService} from './ide.service';

@Component({
    selector: 'app-ide',
    templateUrl: './ide.component.html',
    styleUrls: ['./ide.component.scss']
})
export class IdeComponent implements OnInit, OnDestroy {
    public currentProject: Project;
    public currentFile: SourceFile;
    public lastOutput: SourceCodeDto;
    public files: SourceFile[];

    private paramsSub: Subscription;
    private currentProjectSub: Subscription;

    constructor(public authService: AuthService,
                private ideService: IdeService,
                private route: ActivatedRoute,
                private router: Router) {
        this.currentProjectSub = this.ideService.currentProject$.subscribe((project) => {
            this.currentProject = project;
        });
        this.paramsSub = this.route.params.subscribe((params) => {
            const projectId: string = params.id;
            if (!this.currentProject || this.currentProject.id !== projectId) {
                this.ideService.getProject(projectId);
            }
        });
    }

    ngOnInit() {
    }


    ngOnDestroy(): void {
        if (this.paramsSub) {
            this.paramsSub.unsubscribe();
        }
        if (this.currentProjectSub) {
            this.currentProjectSub.unsubscribe();
        }
    }

    public closeIde() {
        this.ideService.currentProjectId$.next(null);
        this.ideService.currentFile$.next(null);
        this.ideService.currentProject$.next(null);
        this.ideService.files$.next([]);
        this.ideService.unsavedState$.next(false);
        this.router.navigateByUrl('/manage-projects');
    }
}
