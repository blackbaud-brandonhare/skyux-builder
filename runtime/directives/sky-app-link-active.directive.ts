import { Directive, Input, OnInit } from '@angular/core';
import { Router, RouterLinkActive } from '@angular/router';

@Directive({
  selector: '[skyAppLink]'
})
export class SkyAppLinkActiveDirective extends RouterLinkActive implements OnInit {

  constructor(
      router: Router,
      element: ElementRef,
      renderer: Renderer,
      cdr: ChangeDetectorRef
    ) {
      super(router, element, renderer, cdr);
    }

  }
}
