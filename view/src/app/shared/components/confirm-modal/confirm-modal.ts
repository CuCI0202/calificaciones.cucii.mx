import { Component, inject } from '@angular/core';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
})
export class ConfirmModal {
  protected readonly service = inject(ConfirmService);

  confirm(): void {
    this.service.resolve(true);
  }

  cancel(): void {
    this.service.resolve(false);
  }
}
