import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {SourceCodeDto} from '../../shared/ts-api';
import {Subscription} from 'rxjs';
import {IdeService} from '../ide.service';

@Component({
    selector: 'ide-console',
    templateUrl: './ide-console.component.html',
    styleUrls: ['./ide-console.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class IdeConsoleComponent implements OnInit, OnDestroy {

    public lastOutput: SourceCodeDto;

    private lastOutputSub: Subscription;

    constructor(private ideService: IdeService) {
        this.lastOutputSub = this.ideService.lastOutput$.subscribe((output) => {
            this.lastOutput = output;
            if (!output.stderr && !output.stdout) {
                this.lastOutput.stdout = 'Successfully compiled...';
            }
        });
    }

    ngOnInit() {
    }

    ngOnDestroy(): void {
        if (this.lastOutputSub) {
            this.lastOutputSub.unsubscribe();
        }
    }

}
