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
import { MatSlideToggle } from '@angular/material/slide-toggle';


@Component({
  selector: 'app-add-source-item-dialog',
  templateUrl: './add-source-item-dialog.component.html',
  styleUrl: './add-source-item-dialog.component.css',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButton,
    MatFormFieldModule,
    MatInputModule,
    ColorChromeModule,
    MatSlideToggle
  ],
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
        isBreak: this.sourceItem.isBreak
      });
    }
  }

  sourceItemForm = this.formBuilder.group({
    name: ['', Validators.required],
    colorHex: new FormControl('#ffffff'),
    isBreak: false,
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
