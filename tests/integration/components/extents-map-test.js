import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { resolve } from 'rsvp';

module('Integration | Component | extents-map', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // stub the newMap() function so that a map is not constructed
    const mapService = this.owner.lookup('service:map-service');
    const stub = this.stub(mapService, 'newMap').callsFake(() => {
      // return a promise
      return resolve();
    });


    // Set any properties with this.set('myProperty', 'value');
    // TODO: this.set('items', mockItems)
    // Handle any actions with this.set('myAction', function(val) { ... });

    // TODO: {{extents-map items=items}}
    await render(hbs`{{extents-map}}`);

    assert.ok(stub.calledOnce, 'newMap was called once');
  });
});
