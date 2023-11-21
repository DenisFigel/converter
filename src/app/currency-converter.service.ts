import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';

export interface CUrrencyResponse {
  result: string;
  documentation: string;
  terms_of_use: string;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  time_next_update_utc: string;
  base_code: string;
  target_code: string;
  conversion_rate: number;
};
@Injectable({
  providedIn: 'root',
})
export class CurrencyConverterService {
  private apiUrl = 'https://v6.exchangerate-api.com/v6/c2634e5b4b45acf96534d223/pair/';

  constructor(private http: HttpClient) {}

  public convertCurrency(pair: string = 'USD/UAH'): Observable<CUrrencyResponse> {
    return this.http.get<CUrrencyResponse>(this.apiUrl + pair).pipe(
      shareReplay()
    );
  }

  public logError(message: HttpErrorResponse): void {
    console.log('Error:', message);
  }
}
