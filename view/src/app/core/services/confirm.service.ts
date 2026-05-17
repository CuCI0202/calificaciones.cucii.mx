import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  readonly show = signal(false);
  readonly title = signal('');
  readonly message = signal('');

  private resolveRef: ((value: boolean) => void) | null = null;

  confirm(message: string, title = 'Confirmar'): Observable<boolean> {
    this.message.set(message);
    this.title.set(title);
    this.show.set(true);
    return new Observable<boolean>((observer) => {
      this.resolveRef = (result: boolean) => {
        observer.next(result);
        observer.complete();
        this.show.set(false);
        this.resolveRef = null;
      };
    });
  }

  resolve(value: boolean): void {
    this.resolveRef?.(value);
  }
}
