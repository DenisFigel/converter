import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appOnlyNumbers]',
})
export class OnlyNumbersDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const inputElement = this.el.nativeElement as HTMLInputElement;
    const inputValue = inputElement.value;

    const sanitizedValue = this.sanitizeInput(inputValue);
    if (sanitizedValue !== inputValue) {
      inputElement.value = sanitizedValue;
      event.preventDefault();
    }
  }

  private sanitizeInput(input: string): string {
    let hasDecimal = false;

    const result = input.split('').filter(char => {
      if (char === '.') {
        if (!hasDecimal) {
          hasDecimal = true;
          return true;
        }
        return false; // Skip additional decimal points
      } else {
        return (char >= '0' && char <= '9');
      }
    });

    return result.join('');
  }
}
