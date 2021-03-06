/*jshint jasmine: true, node: true */
'use strict';

describe('SKY UX Builder component generator', () => {

  let generator;
  beforeEach(() => {
    generator = require('../lib/sky-pages-component-generator');
  });

  it('should extract a component name', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'me.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue('@Component({}) export class MyCustomComponent {}');

    const components = generator.getComponents({
      srcPath: '',
      componentsPattern: ''
    });
    expect(components.names).toContain('MyCustomComponent');
  });

  it('should extract a component name regardless of whitespace', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'me.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue(`
      @Component({

      })
      export     class      MyCustomComponent4 {

      }  `);

    const components = generator.getComponents({
      srcPath: '',
      componentsPattern: ''
    });
    expect(components.names).toContain('MyCustomComponent4');
  });

  it('should throw an error if an exported class could not be found', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'my-component1.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue('class MyClass {}');

    const err = new Error(`Unable to locate an exported class in ${file}`);
    const wrapper = function () {
      generator.getComponents({
        srcPath: '',
        componentsPattern: ''
      });
    };

    expect(wrapper).toThrow(err);
  });

  it('should throw an error if the unable to find the @Component decorator', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'my-component2.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue('export class MyClass {}');

    const err = new Error(`Unable to locate an exported class in ${file}`);
    const wrapper = function () {
      generator.getComponents({
        srcPath: '',
        componentsPattern: ''
      });
    };

    expect(wrapper).toThrow(err);
  });

  it('should throw an error if more than one exported component per file', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'my-component3.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue(`
      @Component({
      }) export class MyCustomComponent1 {}

      @Component({
      }) export class MyCustomComponent2 {}`);

    const err = new Error(`As a best practice, please export one component per file in ${file}`);
    const wrapper = function () {
      generator.getComponents({
        srcPath: '',
        componentsPattern: ''
      });
    };

    expect(wrapper).toThrow(err);
  });

  it('should import components', () => {
    const components = generator.getComponents({
      components: [
        {
          importPath: 'me.component',
          componentName: 'MeComponent'
        }
      ]
    });

    expect(components.names).toContain('MeComponent');
    expect(components.imports).toContain(
      `import { MeComponent } from 'me.component'`
    );
  });

  it('should allow the SPA path alias to be overridden', () => {
    const fs = require('fs');
    const glob = require('glob');
    const file = 'me.component.ts';

    spyOn(glob, 'sync').and.returnValue([file]);
    spyOn(fs, 'readFileSync').and.returnValue('@Component({}) export class MyComponent {}');

    const components = generator.getComponents({
      srcPath: '',
      componentsPattern: '',
      spaPathAlias: '../..',
    });

    expect(components.imports).toContain(
      `import { MyComponent } from '../../me.component'`
    );
  });

});
