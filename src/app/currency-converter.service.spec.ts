import { TestBed } from '@angular/core/testing';

import { CUrrencyResponse, CurrencyConverterService } from './currency-converter.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

describe('CurrencyConverterService', () => {
  let service: CurrencyConverterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(CurrencyConverterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return values by "convertCurrency()" call', () => {
    const responseData: CUrrencyResponse = {
      "result": "success",
      "documentation": "https://www.exchangerate-api.com/docs",
      "terms_of_use": "https://www.exchangerate-api.com/terms",
      "time_last_update_unix": 1700524801,
      "time_last_update_utc": "Tue, 21 Nov 2023 00:00:01 +0000",
      "time_next_update_unix": 1700611201,
      "time_next_update_utc": "Wed, 22 Nov 2023 00:00:01 +0000",
      "base_code": "USD",
      "target_code": "UAH",
      "conversion_rate": 36.1003
    };
    const spy = spyOn(service, 'convertCurrency').and.returnValue(of(responseData));

    service.convertCurrency();

    expect(spy).toHaveBeenCalled();
  });

  it('should log error message on "logError()" call', () => {
    const spy = spyOn(window.console, 'log');
    const error = {
      "headers": {
          "normalizedNames": {},
          "lazyUpdate": null
      },
      "status": 404,
      "statusText": "OK",
      "url": "https://v6.exchangerate-api.com/v6/c2634e5b4b45acf96534d223/pair/USD/UAH123",
      "ok": false,
      "name": "HttpErrorResponse",
      "message": "Http failure response for https://v6.exchangerate-api.com/v6/c2634e5b4b45acf96534d223/pair/USD/UAH123: 404 OK",
      "error": "<html>\n<head><title>404 Not Found</title></head>\n<body>\n<center><h1>404 Not Found</h1></center>\n<hr><center>nginx</center>\n</body>\n</html>\n\n\n\n\n\n\n"
    };
    service.logError(error as any);

    expect(spy).toHaveBeenCalledWith('Error:', error);
  });
});
