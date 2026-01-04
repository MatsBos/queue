import {
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'app-salvo-dropdown',
  imports: [],
  templateUrl: './salvo-dropdown.component.html',
  styleUrl: './salvo-dropdown.component.css',
})
export class SalvoDropdownComponent {
  valueChange = output<string>();
  currentOption = input<string>('');

  open = signal(false);

  constructor(private el: ElementRef) {}

  options = [
    { label: 'None', value: '' },
    { label: 'Slomo', value: 'Slomo' },
    { label: 'Short', value: 'Short' },
    { label: 'REAX', value: 'REAX' },
    { label: 'Real Time', value: 'Real Time' },
  ];

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.el.nativeElement.contains(event.target)) {
      this.open.set(false);
    }
  }

  select(option: { label: string; value: string }) {
    this.valueChange.emit(option.value);
    this.open.set(false);
  }
}
