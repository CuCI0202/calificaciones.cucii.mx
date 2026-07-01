interface PageItem {
  label: string;
  page: number | null;
  active: boolean;
}

import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  imports: [],
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  totalElements = input(0);
  totalPages = input(0);
  currentPage = input(0);
  pageSize = input(20);

  pageChange = output<number>();
  sizeChange = output<number>();

  readonly pageSizeOptions = [10, 20, 50];

  readonly startItem = computed(() => {
    if (this.totalElements() === 0) return 0;
    return this.currentPage() * this.pageSize() + 1;
  });

  readonly endItem = computed(() => {
    const end = (this.currentPage() + 1) * this.pageSize();
    return Math.min(end, this.totalElements());
  });

  readonly pages = computed<PageItem[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    const result: PageItem[] = [];

    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        result.push({ label: String(i + 1), page: i, active: i === current });
      }
      return result;
    }

    result.push({ label: '1', page: 0, active: current === 0 });

    if (current > 2) result.push({ label: '...', page: null, active: false });

    const start = Math.max(1, current - 1);
    const end = Math.min(total - 2, current + 1);
    for (let i = start; i <= end; i++) {
      result.push({ label: String(i + 1), page: i, active: i === current });
    }

    if (current < total - 3) result.push({ label: '...', page: null, active: false });

    result.push({ label: String(total), page: total - 1, active: current === total - 1 });

    return result;
  });

  onPageClick(item: PageItem): void {
    if (item.page === null) return;
    if (item.page === this.currentPage()) return;
    if (item.page < 0 || item.page >= this.totalPages()) return;
    this.pageChange.emit(item.page);
  }

  onSizeChange(event: Event): void {
    const size = +(event.target as HTMLSelectElement).value;
    this.sizeChange.emit(size);
  }
}
