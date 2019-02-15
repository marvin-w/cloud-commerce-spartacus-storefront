import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, filter, switchMap } from 'rxjs/operators';
import { RoutingService } from '../../../routing';
import { ProductService } from '../../../product';
import { Page } from '../../../cms';
import { PageType } from '../../../occ';
import { PageTitleResolver } from './page-title.resolver';

@Injectable({
  providedIn: 'root'
})
export class ProductPageTitleResolver extends PageTitleResolver {
  constructor(
    protected routingService: RoutingService,
    protected productService: ProductService
  ) {
    super();
  }

  hasMatch(page: Page) {
    return page.type === PageType.PRODUCT_PAGE;
  }

  resolve(): Observable<string> {
    return this.routingService.getRouterState().pipe(
      map(state => state.state.params['productCode']),
      filter(Boolean),
      switchMap(code =>
        this.productService.get(code).pipe(
          filter(Boolean),
          map(p => p.name)
        )
      )
    );
  }
}