import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent {
  @Input() currentPage: number;
  @Input() totalPages: number;
  @Input() totalRegistros: number;
  @Input() totalRegistrosPage: number;
  @Output() pageChange = new EventEmitter<{ page: number, limit: number, offset: number }>();

  limit: number = 7; // número máximo de elementos por página
  offset: number; // número de elementos que se deben omitir


  get pages(): number[] {
    const pagesArray: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  changePage(newPage: number): void {
    if (newPage >= 1 && newPage <= this.totalPages && newPage !== this.currentPage) {
      this.offset = (newPage - 1) * this.limit;
      this.pageChange.emit({ page: newPage, limit: this.limit, offset: this.offset });
    }
  }
}
