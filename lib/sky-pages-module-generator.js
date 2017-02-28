/*jshint node: true*/
'use strict';

const merge = require('merge');
const componentGenerator = require('./sky-pages-component-generator');
const routeGenerator = require('./sky-pages-route-generator');
const bootstrapGenerator = require('./sky-pages-bootstrap-generator');
/**
 * Generates the source necessary to register all routes + components.
 * Declared in order to satisfy jshint.
 * @name getSource
 * @returns {string} source
 */
function getSource(skyPagesConfig) {

  // We put our defaults here instead of skyuxconfig.json for testing purposes
  skyPagesConfig = merge.recursive({
    srcPath: 'src/app/',
    routesPattern: '**/index.html',
    componentsPattern: '**/*.component.ts',
    spaPathAlias: 'sky-pages-spa',
    skyPagesOutAlias: 'sky-pages-internal',
    skyuxPathAlias: '@blackbaud/skyux/dist',
    runtimeAlias: 'sky-pages-internal/runtime',
    useTemplateUrl: false
  }, skyPagesConfig);

  // Generate these first so we can check for 404 route
  const components = componentGenerator.getComponents(skyPagesConfig);
  const componentNames = components.names;

  // Should we add the 404 route
  if (componentNames.indexOf('NotFoundComponent') === -1) {
    skyPagesConfig.handle404 = true;
  }

  const bootstrap = bootstrapGenerator.getBootstrap(skyPagesConfig);
  const routes = routeGenerator.getRoutes(skyPagesConfig);
  const names = `${componentNames.concat(routes.names).join(',\n    ')}`;

  let runtimeImports = [
    'SkyAppRouter',
    'SkyPagesProvider',
    'SKY_PAGES'
  ];

  let runtimeProviders = [
    `Location`,
    `RouterOutletMap`,
    `{provide: UrlSerializer, useClass: DefaultUrlSerializer}`,
    `{provide: NgModuleFactoryLoader, useClass: SystemJsNgModuleLoader}`,
    `{
      provide: LocationStrategy,
      useFactory: provideLocationStrategy,
      deps: [
        PlatformLocation, [new Inject(APP_BASE_HREF), new Optional()]
      ]
    }`,
    `{
      provide: Router,
      useFactory: setupSkyAppRouter,
      deps: [
        ApplicationRef, UrlSerializer, RouterOutletMap, Location, Injector, NgModuleFactoryLoader,
        Compiler
      ]
    }`,
    `{
      provide: SkyPagesProvider,
      useValue: SKY_PAGES
    }`
  ];

  if (skyPagesConfig.auth) {
    runtimeImports.push(`SkyAuthHttp`);
    runtimeProviders.push(`{
      provide: SkyAuthHttp,
      useClass: SkyAuthHttp,
      deps: [XHRBackend, RequestOptions]
    }`);
  }

  let moduleSource =
`${bootstrap}import '${skyPagesConfig.skyPagesOutAlias}/src/main';

import {
  ApplicationRef,
  Compiler,
  Component,
  enableProdMode,
  Inject,
  Injector,
  NgModule,
  NgModuleFactoryLoader,
  Optional,
  OnInit,
  OnDestroy,
  OpaqueToken,
  SystemJsNgModuleLoader,
  Type
} from '@angular/core';

import {
  APP_BASE_HREF,
  CommonModule,
  HashLocationStrategy,
  Location,
  LocationStrategy,
  PathLocationStrategy,
  PlatformLocation
} from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, XHRBackend, RequestOptions } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  DefaultUrlSerializer,
  Route,
  Router,
  RouterModule,
  RouterOutletMap,
  Routes,
  UrlSerializer
} from '@angular/router';

import { Subscription } from 'rxjs/Subscription';
import { SkyModule } from '${skyPagesConfig.skyuxPathAlias}/core';
import { AppExtrasModule } from '${skyPagesConfig.skyPagesOutAlias}/src/app/app-extras.module';
import { ${runtimeImports.join()} } from '${skyPagesConfig.runtimeAlias}';

${components.imports}
${routes.definitions}

// Routes need to be defined after their corresponding components
const routes: Routes = ${routes.declarations};

type ErrorHandler = (error: any) => any

interface ExtraOptions {
  enableTracing?: boolean;
  useHash?: boolean;
  initialNavigation?: boolean;
  errorHandler?: ErrorHandler;
  preloadingStrategy?: any;
}

export function setupSkyAppRouter(
  ref: ApplicationRef,
  urlSerializer: UrlSerializer,
  outletMap: RouterOutletMap,
  location: Location,
  injector: Injector,
  loader: NgModuleFactoryLoader,
  compiler: Compiler
) {
  console.log(ref);
  console.log(urlSerializer);
  console.log(outletMap);
  console.log(location);
  console.log(injector);
  console.log(loader);
  console.log(compiler);
  console.log(routes);
  const router = new SkyAppRouter(
    null,
    urlSerializer,
    outletMap,
    location,
    injector,
    loader,
    compiler,
    routes
  );
  return router;
}

function provideLocationStrategy(
  platformLocationStrategy: PlatformLocation,
  baseHref: string,
  options: ExtraOptions = {}
) {
  return options.useHash ? new HashLocationStrategy(platformLocationStrategy, baseHref) :
                           new PathLocationStrategy(platformLocationStrategy, baseHref);
}

if (SKY_PAGES.command === 'build') {
  enableProdMode();
}

@NgModule({
  declarations: [
    ${names}
  ],
  imports: [
    BrowserModule,
    CommonModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    SkyModule,
    AppExtrasModule
  ],
  exports: [
    ${names}
  ],
  providers: [
    ${runtimeProviders.join()}
  ]
}) export class SkyPagesModule { }`;

  return moduleSource;
}

module.exports = {
  getSource: getSource
};
