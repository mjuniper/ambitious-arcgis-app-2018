import { module, test } from 'qunit';
import { visit, click, fillIn, currentURL, findAll, waitUntil } from '@ember/test-helpers';
import { later } from '@ember/runloop';
import { setupApplicationTest } from 'ember-qunit';

module('Acceptance | smoke', function(hooks) {
  setupApplicationTest(hooks);

  test('smoke-test', async function(assert) {
    await visit('/');

    assert.equal(currentURL(), '/');

    await fillIn('form .input-group input', 'water');
    await click('form .input-group button');

    // force the test to wait a bit longer
    // this should not be necessary but appears to be... _sometimes_
    let flag = false;
    later(() => flag = true, 200);
    await waitUntil(() => flag);

    assert.equal(currentURL(), '/items?q=water');
    assert.equal(findAll('table tbody tr').length, 10);
  });
});
