import { Component, inject, OnInit, signal } from '@angular/core';
import { IndexedDbService } from '../../services/indexed-db.service';
import { SourceItem } from '../../interfaces/source-item';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AddSourceItemDialogComponent } from '../../components/add-source-item-dialog/add-source-item-dialog.component';
import { ContrastTextColorPipe } from '../../pipes/contrast-text-color.pipe';

@Component({
  selector: 'app-source-manager',
  imports: [MatButtonModule, MatIconModule, ContrastTextColorPipe],
  templateUrl: './source-manager.component.html',
  styleUrl: './source-manager.component.css',
})
export class SourceManagerComponent implements OnInit {
  readonly indexedDBService = inject(IndexedDbService);
  readonly dialog = inject(MatDialog);

  sourceList = signal<SourceItem[]>([]);

  async ngOnInit(): Promise<void> {
    this.sourceList.set(await this.indexedDBService.getSourceItems());
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
