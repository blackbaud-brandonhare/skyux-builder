import { Location } from '@angular/common';

import {
  Compiler,
  Injectable,
  Injector,
  NgModuleFactoryLoader,
  Type
} from '@angular/core';

import {
  NavigationExtras,
  Router,
  Routes,
  RouterOutletMap,
  UrlSerializer,
  UrlTree
} from '@angular/router';

@Injectable()
export class SkyAppRouter extends Router {

  private envid: string = 'test';

  public navigateByUrl(
    url: string | UrlTree,
    extras?: NavigationExtras
  ): Promise<boolean> {
    const urlAsString = url.toString();

    if (url instanceof UrlTree && !url.queryParams['envid']) {
      url.queryParams['envid'] = this.envid;
    } else if (urlAsString.indexOf('envid=') === -1) {
      url += `${urlAsString.indexOf('?') === -1 ? '?' : '&'}envid=${this.envid}`;
    }

    return super.navigateByUrl(url, extras);
  }

  public navigate(
    commands: any[],
    extras: NavigationExtras = {skipLocationChange: false}
  ): Promise<boolean> {

    if (extras.queryParams && !extras.queryParams['envid']) {
      extras.queryParams['envid'] = this.envid;
    }

    return super.navigate(commands, extras);
  }

  constructor(
    rootComponentType: Type<any>,
    urlSerializer: UrlSerializer,
    outletMap: RouterOutletMap,
    location: Location,
    injector: Injector,
    loader: NgModuleFactoryLoader,
    compiler: Compiler,
    config: Routes
  ) {
    super(
      rootComponentType,
      urlSerializer,
      outletMap,
      location,
      injector,
      loader,
      compiler,
      config
    );
  }
}
