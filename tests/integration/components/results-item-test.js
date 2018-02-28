import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | results-item', function(hooks) {
  setupRenderingTest(hooks);

  // test('it renders', async function(assert) {
  //   // Set any properties with this.set('myProperty', 'value');
  //   // Handle any actions with this.set('myAction', function(val) { ... });
  //
  //   await render(hbs`{{results-item}}`);
  //
  //   assert.equal(this.element.textContent.trim(), '');
  //
  //   // Template block usage:
  //   await render(hbs`
  //     {{#results-item}}
  //       template block text
  //     {{/results-item}}
  //   `);
  //
  //   assert.equal(this.element.textContent.trim(), 'template block text');
  // });

  test('it renders', async function(assert) {
    const model = EmberObject.create({
      title: 'This is the title',
      type: 'Web Map',
      owner: 'username'
    });
    this.set('model', model);

    await render(hbs`{{results-item model=model}}`);

    assert.equal(this.$('tr td').length, 3, 'renders a tr with 3 tds');
    assert.equal(this.$('tr td:first').text(), 'This is the title', 'renders the title');
    assert.equal(this.$('tr td:nth-child(2)').text(), 'Web Map', 'renders the type');
    assert.equal(this.$('tr td:nth-child(3)').text(), 'username', 'renders the owner');
  });
});
