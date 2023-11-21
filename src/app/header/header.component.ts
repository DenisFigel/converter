import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CUrrencyResponse, CurrencyConverterService } from '../currency-converter.service';
import { DecimalPipe } from '@angular/common';

export type CurrencyType = 'USD' | 'EUR';
type Currency = { [key in CurrencyType]?: number | undefined };

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: [DecimalPipe]
})
export class HeaderComponent implements OnInit {
  public currencies: Currency = {};
  public USD: CurrencyType = 'USD';
  public EUR: CurrencyType = 'EUR';

  constructor(private currencyConverterService: CurrencyConverterService,
              private _decimalPipe: DecimalPipe) {
  }

  public ngOnInit(): void {
    this.convertCurrency();
  }

  private convertCurrency(): void {
    const observable1$ = this.currencyConverterService.convertCurrency(),
          observable2$ = this.currencyConverterService.convertCurrency('EUR/UAH');

    forkJoin([observable1$, observable2$]).subscribe((results: CUrrencyResponse[]) => {
      const [result1, result2] = results;

      this.currencies[result1.base_code as CurrencyType] = result1.conversion_rate !== null ? +this._decimalPipe.transform(result1.conversion_rate, '1.2-2')! : undefined;
      this.currencies[result2.base_code as CurrencyType] = result2.conversion_rate !== null ? +this._decimalPipe.transform(result2.conversion_rate, '1.2-2')! : undefined;
    });
  }
}
