import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import * as fromRoot from '../../../../routing/store';
import * as fromCheckout from '../../../store';
import * as fromCart from '../../../../cart/store';
import * as fromUser from '../../../../user/store';

import { StoreModule, Store, combineReducers } from '@ngrx/store';

import { AddressFormComponent } from './address-form.component';
import {
  ReactiveFormsModule,
  FormGroup,
  AbstractControl
} from '@angular/forms';

import { of } from 'rxjs';
import * as fromRouting from '../../../../routing/store';
import { MaterialModule } from '../../../../material.module';
import { CheckoutService } from '../../../services';
import { CartService } from '../../../../cart/services';
import { MatDialog } from '@angular/material';
import { AddressFormModule } from './address-form.module';

export class MockAbstractControl {
  hasError() {}
  enable() {}
  disable() {}
}

export class MockFormGroup {
  get() {}
}
const mockTitlesList = {
  titles: [
    {
      code: 'mr',
      name: 'Mr.'
    },
    {
      code: 'mrs',
      name: 'Mrs.'
    }
  ]
};

const mockCountriesList = {
  countries: [
    {
      isocode: 'AL',
      name: 'Albania'
    },
    {
      isocode: 'AD',
      name: 'Andorra'
    }
  ]
};

const mockRegionsList = {
  regions: [
    {
      isocode: 'CA-ON',
      name: 'Ontario'
    },
    {
      isocode: 'CA-QC',
      name: 'Quebec'
    }
  ]
};

describe('AddressFormComponent', () => {
  let store: Store<fromCheckout.CheckoutState>;
  let component: AddressFormComponent;
  let fixture: ComponentFixture<AddressFormComponent>;
  let ac: AbstractControl;
  let dialog: MatDialog;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MaterialModule,
        AddressFormModule,
        StoreModule.forRoot({
          ...fromRoot.getReducers(),
          checkout: combineReducers(fromCheckout.getReducers()),
          cart: combineReducers(fromCart.getReducers()),
          user: combineReducers(fromUser.getReducers())
        })
      ],
      providers: [
        CheckoutService,
        CartService,
        { provide: FormGroup, useClass: MockFormGroup },
        { provide: AbstractControl, useClass: MockAbstractControl }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddressFormComponent);
    component = fixture.componentInstance;
    store = TestBed.get(Store);
    ac = TestBed.get(AbstractControl);
    dialog = TestBed.get(MatDialog);

    spyOn(store, 'dispatch').and.callThrough();
    spyOn(ac, 'hasError').and.callThrough();
    spyOn(component.addAddress, 'emit').and.callThrough();
    spyOn(component.verifyAddress, 'emit').and.callThrough();
    spyOn(component, 'addNewAddress').and.callThrough();
    spyOn(component.address, 'get').and.returnValue(ac);
    spyOn(dialog, 'open').and.callThrough();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should call addressSelected(address)', () => {
    const mockAddress = 'mockAddress';

    component.addressSelected(mockAddress);

    expect(component.addAddress.emit).toHaveBeenCalledWith({
      address: mockAddress,
      newAddress: false
    });
  });

  it('should call addNewAddress()', () => {
    expect(component.newAddress).toBeFalsy();

    component.addNewAddress();

    expect(component.newAddress).toBeTruthy();
  });

  it('should call ngOnInit to get countries and titles data even when they not exist', () => {
    spyOn(store, 'select').and.returnValues(of({}), of({}), of({}));
    component.ngOnInit();
    component.countries$.subscribe(() => {
      expect(store.dispatch).toHaveBeenCalledWith(
        new fromUser.LoadDeliveryCountries()
      );
    });
    component.titles$.subscribe(() => {
      expect(store.dispatch).toHaveBeenCalledWith(new fromUser.LoadTitles());
    });
  });

  it('should call ngOnInit to get countries, titles and regions data when data exist', () => {
    spyOn(store, 'select').and.returnValues(
      of({ mockCountriesList }),
      of({ mockTitlesList }),
      of({ mockRegionsList })
    );
    component.ngOnInit();
    component.countries$.subscribe(data => {
      expect(data.mockCountriesList).toBe(mockCountriesList);
    });
    component.titles$.subscribe(data => {
      expect(data.mockTitlesList).toBe(mockTitlesList);
    });
    component.regions$.subscribe(data => {
      expect(data.mockRegionsList).toBe(mockRegionsList);
    });
  });

  it('should call next()', () => {
    component.next();
    expect(component.verifyAddress.emit).toHaveBeenCalled();
  });

  it('should call back()', () => {
    component.back();
    expect(store.dispatch).toHaveBeenCalledWith(
      new fromRouting.Go({
        path: ['/cart']
      })
    );
  });

  it('should call back() and redirect to saved addresses page of there are saved addresses', () => {
    component.newAddress = true;

    component.back();

    expect(store.dispatch).not.toHaveBeenCalledWith(
      new fromRouting.Go({
        path: ['/cart']
      })
    );
    expect(component.newAddress).toBeFalsy();
  });

  it('should call required(name: string)', () => {
    component.required('someName');
    expect(component.address.get).toHaveBeenCalledWith('someName');
  });

  it('should call notSelected(name: string)', () => {
    component.notSelected('someName');
    expect(component.address.get).toHaveBeenCalledWith('someName');
  });

  it('should call toggleDefaultAddress()', () => {
    component.address.value.defaultAddress = false;
    component.toggleDefaultAddress();
    expect(component.address.value.defaultAddress).toBeTruthy();
  });
});