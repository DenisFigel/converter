import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Subscription, debounceTime, switchMap } from 'rxjs';
import { CurrencyType } from './header/header.component';
import { CUrrencyResponse, CurrencyConverterService } from './currency-converter.service';
import { DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DecimalPipe]
})
export class AppComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup = this.formBuilder.group({
    from: this.formBuilder.group({
      value: [null, [Validators.required, Validators.minLength(1)]],
      currency: ['USD', Validators.required],
    }),
    to: this.formBuilder.group({
      value: [null, [Validators.required, Validators.minLength(1)]],
      currency: ['UAH', Validators.required],
    })
  });

  private subscriptions: Subscription = new Subscription();

  constructor(private formBuilder: UntypedFormBuilder,
              private CurrencyConverterService: CurrencyConverterService,
              private _decimalPipe: DecimalPipe) {}

  public ngOnInit(): void {
    this.setupFormSubscription('from');
    this.setupFormSubscription('to');
  }

  private setupFormSubscription(controlName: 'from' | 'to'): void {
    const formControl = this.form.get(controlName);
    if (!formControl) {
      return;
    }

    this.subscriptions.add(
      formControl.valueChanges.pipe(
        debounceTime(300),
        switchMap((data: { currency: CurrencyType, value: number }) => {
          const oppositeControlName = controlName === 'from' ? 'to' : 'from',
                oppositeFormControl = this.form.get(oppositeControlName),
                oppositeCurrency = oppositeFormControl?.get('currency')?.value;

          if (data.value !== null && data.value > 0 && oppositeCurrency) {
            const params = `${data.currency}/${oppositeCurrency}`;

            return this.CurrencyConverterService.convertCurrency(params);
          } else {
            oppositeFormControl?.get('value')?.setValue(null, {emitEvent: false});

            return [];
          }
        })
      ).subscribe((res: CUrrencyResponse) => {
        const result = this.calculateResult(res, controlName),
              oppositeControl = this.form.get(controlName === 'from' ? 'to' : 'from');

        oppositeControl?.get('value')?.setValue(result, {emitEvent: false});
      }, (error: HttpErrorResponse) => {
        this.CurrencyConverterService.logError(error);
      })
    );
  }

  private calculateResult(res: CUrrencyResponse, controlName: 'from' | 'to'): string | null {
    const valueControl = this.form.get(controlName)?.get('value');
    if (!valueControl) {
      return null;
    }

    const result = this._decimalPipe.transform(+valueControl.value * res.conversion_rate, '1.2-2')?.replaceAll(',', '');

    return result || null;
  }

  public ngOnDestroy(): void {
      this.subscriptions.unsubscribe();
  }
}
