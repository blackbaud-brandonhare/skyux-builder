import { Directive, Input, OnInit } from '@angular/core';
import { LocationStrategy } from '@angular/common';
import { ActivatedRoute, Router, RouterLinkWithHref } from '@angular/router';

@Directive({
  selector: '[skyAppLink]'
})
export class SkyAppLinkDirective extends RouterLinkWithHref implements OnInit {

  private activatedRoute: ActivatedRoute;

  @Input()
  set skyAppLink(commands: any[]|string) {
    this.routerLink = commands;
  }

  public ngOnInit() {
    this.activatedRoute
      .queryParams
      .take(1)
      .subscribe(params => {
        if (params['envid']) {
          this.queryParams = {
            envid: params['envid']
          };
        }
      });
  }

  constructor(
    router: Router,
    route: ActivatedRoute,
    locationStrategy: LocationStrategy) {
    super(router, route, locationStrategy);
    this.activatedRoute = route;
  }
}
