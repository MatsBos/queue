import { Component, Inject, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ColorChromeModule } from 'ngx-color/chrome';
import { IndexedDbService } from '../../services/indexed-db.service';
import { SourceItem } from '../../interfaces/source-item';

@Component({
  selector: 'app-add-source-item-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    ColorChromeModule,
  ],
  templateUrl: './add-source-item-dialog.component.html',
  styleUrl: './add-source-item-dialog.component.css',
})
export class AddSourceItemDialogComponent {
  readonly indexedDBService = inject(IndexedDbService);
  private formBuilder = inject(FormBuilder);

  constructor(
    @Inject(MAT_DIALOG_DATA) public sourceItem: SourceItem,
    public dialogRef: MatDialogRef<AddSourceItemDialogComponent>
  ) {
    if (this.sourceItem) {
      this.sourceItemForm.setValue({
        name: this.sourceItem.name,
        colorHex: this.sourceItem.colorHex,
      });
    }
  }

  sourceItemForm = this.formBuilder.group({
    name: ['', Validators.required],
    colorHex: new FormControl('#ffffff'),
  });

  colorChange(event: any) {
    this.sourceItemForm.get('colorHex')?.setValue(event.color.hex);
  }

  close() {
    if (this.sourceItemForm.valid) {
      this.dialogRef.close(this.sourceItemForm.value as SourceItem);
    }
  }
}
