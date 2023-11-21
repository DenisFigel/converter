import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrencyType, HeaderComponent } from './header.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { CUrrencyResponse, CurrencyConverterService } from '../currency-converter.service';
import { DecimalPipe } from '@angular/common';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  let decimalPipe: DecimalPipe;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HeaderComponent ],
      imports: [HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    decimalPipe = new DecimalPipe('en-US');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call "convertCurrency()" once on init', () => {
    const spy = spyOn<any>(component, 'convertCurrency');

    component.ngOnInit();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should get and transform currencies by "convertCurrency()(" call', () => {
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
      const spy = spyOn(TestBed.inject(CurrencyConverterService), 'convertCurrency').and.returnValue(of(responseData));

      component['convertCurrency']();

      fixture.detectChanges();

      expect(spy).toHaveBeenCalledTimes(2);
      expect(component.currencies[responseData.base_code as CurrencyType]).toBe(responseData.conversion_rate !== null ? +decimalPipe.transform(responseData.conversion_rate, '1.2-2')! : undefined);
  });

  it('should show currencies on view with values', () => {
    component.currencies[component.USD] = 36.45;
    component.currencies[component.EUR] = 39.75;
    fixture.detectChanges();
    const lis = fixture.nativeElement.querySelectorAll('li');
    expect(lis.length).toBe(2);

    expect(lis[0].innerText).toBe(`${component.USD}: 36.45`);
    expect(lis[1].innerText).toBe(`${component.EUR}: 39.75`);
  });
});
