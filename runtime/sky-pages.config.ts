import { OpaqueToken } from '@angular/core';
export let SkyPagesProvider = new OpaqueToken('app.config');

export interface SkyPagesConfig {}

// Please note, SKY_PAGES is added to this file at runtime
// but the interface above should accurately reflect its contents.
export let SKY_PAGES: SkyPagesConfig = {};
