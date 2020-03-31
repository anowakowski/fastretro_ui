import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl } from '@angular/forms';
import { LocalStorageService } from 'src/app/services/local-storage.service';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[valueDataValidator]',
  providers: [{
    provide: NG_VALIDATORS,
    useExisting: ValueDataValidator,
    multi: true
  }]
})
export class ValueDataValidator implements Validator {
  @Input('valueDataValidator') tags: string[];
  // tslint:disable-next-line:no-input-rename
  @Input('shouldRunValidation') shouldRun: boolean;

  constructor(private localStorageService: LocalStorageService) {}

  validate(control: FormControl) {

    const shouldShowErrorWithWorkspaceExists = this.localStorageService.getItem('shouldShowWithWorkspaceExists');
    const shouldShowCantFindWorkspaceExisits = this.localStorageService.getItem('shouldShowCantFindWorkspace');

    if (shouldShowErrorWithWorkspaceExists) {
      return { workspaceIsExisting: true };
    } else if (shouldShowCantFindWorkspaceExisits) {
      return { workspaceNotExist: true };
    }
    return null;
  }
}
