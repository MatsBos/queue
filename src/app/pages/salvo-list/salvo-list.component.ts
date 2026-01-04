import {
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  Signal,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
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
import {
  MatSnackBar,
  MatSnackBarModule,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AddSourceItemDialogComponent } from '../../components/add-source-item-dialog/add-source-item-dialog.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LocalStorageService } from '../../services/local-storage.service';
import { CommonModule } from '@angular/common';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { SalvoDropdownComponent } from '../../components/salvo-dropdown/salvo-dropdown.component';

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
    CommonModule,
    MatSelectModule,
    SalvoDropdownComponent,
  ],
  templateUrl: './salvo-list.component.html',
  styleUrl: './salvo-list.component.css',
})
export class SalvoListComponent implements OnInit {
  readonly indexedDBService = inject(IndexedDbService);
  private localStorageService = inject(LocalStorageService);
  private _snackBar = inject(MatSnackBar);
  readonly dialog = inject(MatDialog);

  @ViewChildren('salvoEl') salvoElements!: QueryList<ElementRef<HTMLElement>>;

  sourceList = signal<SourceItem[]>([]);
  locked = signal<boolean>(false);
  editSourceMode = signal<boolean>(false);

  private salvoListObs$ = liveQuery(async () => {
    const salvos = await this.indexedDBService.getSalvoItems();
    const sources = await this.indexedDBService.getSourceItems();
    return salvos.map((s) => ({
      ...s,
      sourceItem: sources.find((src) => src.id === s.sourceItemId),
    }));
  });

  async ngOnInit(): Promise<void> {
    this.locked.set(this.localStorageService.isLocked);
    this.sourceList.set(await this.indexedDBService.getSourceItems());
  }

  salvoList = toSignal(this.salvoListObs$, {
    initialValue: [],
  }) as Signal<SalvoItem[]>;

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
        event.currentIndex,
      );

      await this.indexedDBService.addSalvoItem({
        sourceItemId: item.id!,
        order: event.currentIndex,
        done: false,
        isBreak: item.isBreak,
      });
    }

    const currentListUpdates = currentList.map((item, index) => ({
      id: item.id,
      sort: index,
      sourceItemId: item.id,
      sourceItem: item,
      done: item.done,
      isBreak: item.isBreak,
    })) as SalvoItem[];

    await this.indexedDBService.updateSalvoItemOrder(currentListUpdates);
  }

  async tapSourceItem(item: SourceItem) {
    await this.indexedDBService.addSalvoItem({
      sourceItemId: item.id!,
      order: this.salvoList().length,
      done: false,
      isBreak: item.isBreak,
    });

    this._snackBar.open('Salvo added', '', {
      duration: 1000,
      verticalPosition: 'top',
    });

    queueMicrotask(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth',
      });
    });
  }

  deleteSalvoItem(id: number) {
    // const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    //   data: {
    //     message: 'Are you sure you want to delete this salvo?',
    //   },
    // });

    // dialogRef.afterClosed().subscribe((confirmed) => {
    //   if (!confirmed) return;

    this.indexedDBService.deleteSalvoItem(id);
    // });
  }

  toggleSalvoDone(item: SalvoItem) {
    item.done = !item.done;
    this.indexedDBService.updateSalvoItem(item.id!, { done: item.done });

    queueMicrotask(() => {
      const index = this.salvoList().indexOf(item);
      const el = this.salvoElements.get(index)?.nativeElement;

      el?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  toggleLocked() {
    this.locked.set(!this.locked());
    this.localStorageService.isLocked = this.locked();
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
        result as Partial<SourceItem>,
      );
      this.indexedDBService.getSourceItems().then((items) => {
        this.sourceList.set(items);
      });
    });

    this.editSourceMode.set(false);
  }

  deleteSource(id: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure you want to delete this source?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.indexedDBService.deleteSourceItem(id);
      this.indexedDBService.getSourceItems().then((items) => {
        this.sourceList.set(items);
      });
    });
    this.editSourceMode.set(false);
  }

  clearAllSalvos() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: "Are you sure you want to delete all salvo's?",
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.indexedDBService.deleteAllSalvoItems();
    });
  }

  clearAllSources() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Are you sure you want to delete all sources?',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.indexedDBService.deleteAllSourceItems();
    });
  }

  selectNext() {
    const nextItem = this.salvoList().find((item) => !item.done);
    if (!nextItem) return;
    this.indexedDBService.updateSalvoItem(nextItem.id!, {
      done: !nextItem.done,
    });

    queueMicrotask(() => {
      const index = this.salvoList().indexOf(nextItem);
      const el = this.salvoElements.get(index)?.nativeElement;

      el?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }

  dropDownValueChanges(value: string, salvoItem: SalvoItem) {
    console.log('Selected value:', value);
    this.indexedDBService.updateSalvoItem(salvoItem.id!, { extraInfo: value });
  }
}
