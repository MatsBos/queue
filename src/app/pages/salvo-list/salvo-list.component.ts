import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContrastTextColorPipe } from '../../pipes/contrast-text-color.pipe';
import { SourceItem } from '../../interfaces/source-item';
import { IndexedDbService } from '../../services/indexed-db.service';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDrag,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { SalvoItem } from '../../interfaces/salvo-item';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-salvo-list',
  imports: [
    MatButtonModule,
    MatIconModule,
    ContrastTextColorPipe,
    CdkDropList,
    CdkDrag,
    MatSlideToggleModule,
    CdkScrollable,
  ],
  templateUrl: './salvo-list.component.html',
  styleUrl: './salvo-list.component.css',
})
export class SalvoListComponent implements OnInit {
  readonly indexedDBService = inject(IndexedDbService);

  sourceList = signal<SourceItem[]>([]);
  salvoList = signal<SalvoItem[]>([]);

  locked = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    this.sourceList.set(await this.indexedDBService.getSourceItems());
    this.getSalvoItems();
  }

  async getSalvoItems() {
    this.salvoList.set(await this.indexedDBService.getSalvoItemsWithSource());
  }

  async drop(event: CdkDragDrop<any[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      this.updateOrder(event.container.data);
    } else {
      const item = event.previousContainer.data[event.previousIndex];

      const newItem = {
        sourceItemId: item.id!,
        order: event.currentIndex,
        sourceItem: item,
        done: false,
      };

      const salvoList = this.salvoList();
      salvoList.splice(event.currentIndex, 0, newItem);

      // Step 2: Save the new item to Dexie
      await this.indexedDBService.addSalvoItem(newItem);

      // Step 3: Update all order values
      this.updateOrder(salvoList);
    }
    this.getSalvoItems();
  }

  updateOrder(salvoItems: SalvoItem[]) {
    salvoItems.forEach((item, index) => {
      item.order = index;
      this.indexedDBService.updateSalvoItem(item.id!, item); // save updated item to DB
    });
  }

  deleteSalvoItem(id: number) {
    this.indexedDBService.deleteSalvoItem(id);
    this.getSalvoItems();
  }

  toggleSalvoDone(item: SalvoItem) {
    item.done = !item.done;
    this.indexedDBService.updateSalvoItem(item.id!, { done: item.done });
    this.getSalvoItems();
  }

  toggleLocked() {
    this.locked.set(!this.locked());
  }
}
