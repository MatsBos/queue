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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddSourceItemDialogComponent } from '../../components/add-source-item-dialog/add-source-item-dialog.component';
import { MatToolbarModule } from '@angular/material/toolbar';

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
    MatSnackBarModule,
    MatToolbarModule,
  ],
  templateUrl: './salvo-list.component.html',
  styleUrl: './salvo-list.component.css',
})
export class SalvoListComponent implements OnInit {
  readonly indexedDBService = inject(IndexedDbService);
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);

  sourceList = signal<SourceItem[]>([]);

  private salvoListObs$ = liveQuery(async () => {
    const salvos = await this.indexedDBService.getSalvoItems();
    const sources = await this.indexedDBService.getSourceItems();
    return salvos.map((s) => ({
      ...s,
      sourceItem: sources.find((src) => src.id === s.sourceItemId),
    }));
  });

  async ngOnInit(): Promise<void> {
    this.sourceList.set(await this.indexedDBService.getSourceItems());
  }

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
        isBreak: item.isBreak
      });
    }

    const currentListUpdates = currentList.map((item, index) => ({
      id: item.id,
      sort: index,
      sourceItemId: item.id,
      sourceItem: item,
      done: item.done,
      isBreak: item.isBreak
    })) as SalvoItem[];

    await this.indexedDBService.updateSalvoItemOrder(currentListUpdates);

    this._snackBar.open('Salvo added', '', {
      duration: 1000,
    });
  }

  async tapSourceItem(item: SourceItem) {
    await this.indexedDBService.addSalvoItem({
      sourceItemId: item.id!,
      order: this.salvoList().length,
      done: false,
      isBreak: item.isBreak
    });

    this._snackBar.open('Salvo added', '', {
      duration: 1000,
    });
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

  addSource(): void {
    const dialogRef = this.dialog.open(AddSourceItemDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      this.indexedDBService.addSourceItem(result as SourceItem);
      this.indexedDBService.getSourceItems().then((items) => {
        this.sourceList.set(items);
      });
    });
  }

  editSource(item: SourceItem): void {
    const dialogRef = this.dialog.open(AddSourceItemDialogComponent, {
      data: item,
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.indexedDBService.updateSourceItem(
        item.id as number,
        result as Partial<SourceItem>
      );
      this.indexedDBService.getSourceItems().then((items) => {
        this.sourceList.set(items);
      });
    });
  }

  deleteSource(id: number): void {
    this.indexedDBService.deleteSourceItem(id);
    this.indexedDBService.getSourceItems().then((items) => {
      this.sourceList.set(items);
    });
  }
}
