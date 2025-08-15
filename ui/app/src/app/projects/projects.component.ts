import {Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {Project, ProjectEndpoint} from '../shared/ts-api';
import {Router} from '@angular/router';
import {PROJECT_NAME_LIST} from '../shared/project-names';
import {NzInputDirective} from 'ng-zorro-antd';
import {AuthService} from '../shared/services/auth.service';

@Component({
    selector: 'app-projects',
    templateUrl: './projects.component.html',
    styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
    public projects: Project[];
    public projectName: string;
    public currentProject: Project;

    public editId: string | null;

    @ViewChild(NzInputDirective, {static: false, read: ElementRef}) inputElement: ElementRef;

    @HostListener('window:click', ['$event'])
    handleClick(e: MouseEvent): void {
        if (this.editId && this.inputElement && this.inputElement.nativeElement !== e.target) {
            this.editId = null;
        }
    }

    constructor(private projectEndpoint: ProjectEndpoint,
                private router: Router,
                public authService: AuthService) {
    }

    ngOnInit() {
        this.loadProjects();
    }

    public startEdit(id: string, event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.editId = id;
    }

    public loadProjects() {
        this.projectEndpoint.getProjects().subscribe((projects) => {
            this.projects = projects.sort((a, b) => {
                if (a.id < b.id) {
                    return -1;
                }
                if (a.id > b.id) {
                    return 1;
                }
                return 0;
            });
        });
    }

    public createProject() {
        const project: Project = new Project();
        // get random project name
        project.name = PROJECT_NAME_LIST[Math.round(Math.random() * PROJECT_NAME_LIST.length)];
        this.projectEndpoint.createProject(project)
            .subscribe((p) => {
                this.loadProjects();
            });
    }

    public deleteProject(project: Project) {
        this.projectEndpoint.deleteProject(project.id)
            .subscribe((p) => {
                this.loadProjects();
            });
    }

    public selectProject(project: Project) {
        this.router.navigate([`ide/${project.id}`]);
    }

    public updateProject(project: Project) {
        this.projectEndpoint.updateProject(project.id, project)
            .subscribe((p) => {
                this.loadProjects();
            });
    }
}
