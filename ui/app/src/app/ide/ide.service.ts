import {Injectable, OnDestroy} from '@angular/core';
import {DarkModeEndpoint, Project, ProjectEndpoint, SourceCodeDto, SourceFile} from '../shared/ts-api';
import {BehaviorSubject, ReplaySubject, Subscription, timer} from 'rxjs';
import {switchMap} from 'rxjs/operators';

@Injectable()
export class IdeService implements OnDestroy {

    public currentProjectId$: BehaviorSubject<string> = new BehaviorSubject<string>(null);
    public currentProject$: BehaviorSubject<Project> = new BehaviorSubject<Project>(null);
    public currentFile$: ReplaySubject<SourceFile> = new ReplaySubject<SourceFile>(1);
    public lastOutput$: ReplaySubject<SourceCodeDto> = new ReplaySubject<SourceCodeDto>(1);
    public files$: BehaviorSubject<SourceFile[]> = new BehaviorSubject<SourceFile[]>([]);
    public unsavedState$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    public darkModeEnabled$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    private timerSub: Subscription;

    constructor(private projectEndpoint: ProjectEndpoint,
                private darkModeEndpoint: DarkModeEndpoint) {
        this.timerSub = timer(0, 1000)
            .pipe(
                switchMap((_) => this.darkModeEndpoint.darkModeEnabled())
            )
            .subscribe((darkModeEnabled) => {
                if (darkModeEnabled !== this.darkModeEnabled$.getValue()) {
                    console.log('Changing dark mode');
                    this.darkModeEnabled$.next(darkModeEnabled);
                }
            });
    }

    ngOnDestroy(): void {
        this.timerSub.unsubscribe();
    }

    public getProject(projectId: string, updateFiles: boolean = true) {
        this.currentProjectId$.next(projectId);
        this.projectEndpoint.getProject(projectId).subscribe((project) => {
            this.currentProject$.next(project);
        });
        if (updateFiles) {
            this.getFiles();
        }
    }

    public getFiles() {
        this.projectEndpoint.getFilesForProject(this.currentProjectId$.getValue())
            .subscribe((files) => {
                this.files$.next(files);
            });
    }
}
