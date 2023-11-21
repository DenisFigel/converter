import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HeaderComponent } from './header/header.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CUrrencyResponse, CurrencyConverterService } from './currency-converter.service';
import { of, throwError } from 'rxjs';
import { DecimalPipe } from '@angular/common';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  let decimalPipe: DecimalPipe;

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        HeaderComponent
      ],
      imports: [HttpClientTestingModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    decimalPipe = new DecimalPipe('en-US');

    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should show header component', () => {
    expect(fixture.nativeElement.querySelector('app-header')).toBeTruthy();
  });

  it('should set default values for from', () => {
    const fromFromGroup = component.form.get('from');
    const toFormGroup = component.form.get('to');
    // from from group
    expect(fromFromGroup?.get('value')?.value).toBe(null);
    expect(fromFromGroup?.get('currency')?.value).toBe('USD');

    //to from group
    expect(toFormGroup?.get('value')?.value).toBe(null);
    expect(toFormGroup?.get('currency')?.value).toBe('UAH');
  });

  it('should call "setupFormSubscription(): 2 times on init', () => {
    const spy = spyOn<any>(component, 'setupFormSubscription');

    component.ngOnInit();
    fixture.detectChanges();

    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should show error on call "setupFormSubscription()" if response if failed', fakeAsync(() => {
    const service = TestBed.inject(CurrencyConverterService);
    spyOn(service, 'convertCurrency').and.returnValue(throwError(null));
    const logger = spyOn(service, 'logError');

    component.form.get('from')?.get('value')?.setValue(100);
    component['setupFormSubscription']('from');

    fixture.detectChanges();
    tick(300);

    expect(logger).toHaveBeenCalled();
  }));

  it('should call "convertCurrency()" on change values', fakeAsync(() => {

    const spy = spyOn(TestBed.inject(CurrencyConverterService), 'convertCurrency').and.returnValue(of(responseData));

    component.form.get('from')?.get('value')?.setValue(100);
    fixture.detectChanges();

    tick(300);

    const params = `${component.form.get('from')?.get('currency')?.value}/${component.form.get('to')?.get('currency')?.value}`;

    expect(spy).toHaveBeenCalledWith(params);
    const result = decimalPipe.transform(+component.form.get('from')?.get('value')?.value * responseData.conversion_rate, '1.2-2')?.replaceAll(',', '');
    expect(component.form.get('to')?.get('value')?.value).toBe(
      result
    );
  }));

  it('should calculate result by "calculateResult()" call', () => {
    component.form.get('to')?.get('value')?.setValue(50);
    const result = component['calculateResult'](responseData, 'to');
    fixture.detectChanges();

    const counts = decimalPipe.transform((component.form.get('to')?.get('value')?.value * responseData.conversion_rate), '1.2-2');
    expect(result).toBe(counts?.replaceAll(',','').toString()!);
  });

  it('should be 2 inputs and 2 selectboxes on a page', () => {
    const currenciesArr = ['USD', 'UAH', 'EUR'];
    // From Group
    const fromGroup = fixture.nativeElement.querySelector('div[formGroupName="from"]'),
          inputs = fromGroup.querySelectorAll('input'),
          selectbox = fromGroup.querySelectorAll('select'),
          options = selectbox[0].querySelectorAll('option');

    expect(fromGroup).toBeTruthy();

    expect(inputs.length).toBe(1);
    expect(selectbox.length).toBe(1);
    expect(options.length).toBe(3);
    options.forEach((element: HTMLElement, key: number) => {
      expect(element.innerText).toBe(currenciesArr[key]);
    });

    // To Group
    const toGroup = fixture.nativeElement.querySelector('div[formGroupName="to"]'),
          inputsTo = toGroup.querySelectorAll('input'),
          selectboxTo = toGroup.querySelectorAll('select'),
          optionsTo = selectboxTo[0].querySelectorAll('option');

    expect(toGroup).toBeTruthy();

    expect(inputsTo.length).toBe(1);
    expect(selectboxTo.length).toBe(1);
    expect(optionsTo.length).toBe(3);
    optionsTo.forEach((element: HTMLElement, key: number) => {
      expect(element.innerText).toBe(currenciesArr[key]);
    });
    expect(toGroup).toBeTruthy();
  });
});
