import { Component, inject, OnInit, Signal, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ContrastTextColorPipe } from '../../pipes/contrast-text-color.pipe';
import { SourceItem } from '../../interfaces/source-item';
import { toSignal } from '@angular/core/rxjs-interop';

import { IndexedDbService } from '../../services/indexed-db.service';
import {
  CdkDragDrop,
  moveItemInArray,
  CdkDrag,
  CdkDropList,
  copyArrayItem,
} from '@angular/cdk/drag-drop';
import { SalvoItem } from '../../interfaces/salvo-item';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { liveQuery } from 'dexie';

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
export class SalvoListComponent {
  readonly indexedDBService = inject(IndexedDbService);

  private sourceListObs$ = liveQuery<SourceItem[]>(
    async () => await this.indexedDBService.getSourceItems()
  );

  private salvoListObs$ = liveQuery(async () => {
    const salvos = await this.indexedDBService.getSalvoItems();
    const sources = await this.indexedDBService.getSourceItems();
    return salvos.map((s) => ({
      ...s,
      sourceItem: sources.find((src) => src.id === s.sourceItemId),
    }));
  });

  sourceList = toSignal(this.sourceListObs$, {
    initialValue: [],
  }) as Signal<SourceItem[]>;

  salvoList = toSignal(this.salvoListObs$, {
    initialValue: [],
  }) as Signal<SalvoItem[]>;

  locked = signal<boolean>(false);

  async drop(event: CdkDragDrop<any[]>) {
    const previousList = event.previousContainer.data;
    const currentList = event.container.data;

    const item = event.previousContainer.data[event.previousIndex];

    // If same list, just apply new sort
    if (event.previousContainer === event.container) {
      moveItemInArray(currentList, event.previousIndex, event.currentIndex);
    } else {
      copyArrayItem(
        previousList,
        currentList,
        event.previousIndex,
        event.currentIndex
      );

      await this.indexedDBService.addSalvoItem({
        sourceItemId: item.id!,
        order: event.currentIndex,
        done: false,
      });
    }

    const currentListUpdates = currentList.map((item, index) => ({
      id: item.id,
      sort: index,
      sourceItemId: item.id,
      sourceItem: item,
      done: item.done,
    })) as SalvoItem[];

    await this.indexedDBService.updateSalvoItemOrder(currentListUpdates);
  }

  deleteSalvoItem(id: number) {
    this.indexedDBService.deleteSalvoItem(id);
  }

  toggleSalvoDone(item: SalvoItem) {
    item.done = !item.done;
    this.indexedDBService.updateSalvoItem(item.id!, { done: item.done });
  }

  toggleLocked() {
    this.locked.set(!this.locked());
  }
}
