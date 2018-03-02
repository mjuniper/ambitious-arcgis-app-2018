import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | extents-map', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // stub the newMap() function so that a map is not constructed
    const mapService = this.owner.lookup('service:map-service');
    const stub = this.stub(mapService, 'newMap');

    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{extents-map}}`);

    assert.ok(stub.calledOnce, 'newMap was called once');
  });
});
