# Architecture

- `ember s` and visit `localhost:4200`

## Refactor search form into a component

- `ember g component ago-search`
- app/templates/components/ago-search.hbs

```hbs
<form {{action onSearch searchCopy on="submit"}}>
  <div class="input-group {{sizeClass}}">
    {{input class="form-control" placeholder="search for items" value=searchCopy}}
    <div class="input-group-append">
      <button class="btn btn-secondary" type="submit">Search</button>
    </div>
  </div>
</form>
```

- app/components/ago-search.js

```js
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  classNames: ['ago-search'],

  // use a copy so that we don't immediately update bound URL parameters
  searchCopy: computed.reads('q'),

  // allow the consuming template to set the input size ('lg' or 'sm')
  sizeClass: computed('size', function () {
    const size = this.get('size');
    if (size) {
      return `input-group-${size}`;
    } else {
      return '';
    }
  })

});
```

- replace `<form>` tag in app/templates/index.hbs with:

```hbs
{{ago-search q=q onSearch=(action "doSearch") size="lg"}}
```

- replace `doSearch` action in app/controllers/index.js

```js
doSearch (q) {
  this.transitionToRoute('items', {
    queryParams: { q }
  });
}
```

App should look/work the same.

### Notes:
- classNames (customizing the element)
- searchCopy (DDAU)
- sizeClass (data binding)

## Add search component to items page
- `ember g controller items`
- in app/controllers/items.js, add

```js
actions: {
  doSearch (q) {
    // NOTE: don't need to pass route name b/c same route
    this.transitionToRoute({
      queryParams: { q }
    });
  }
}
```

- in app/styles/app.css add:

```css
/* items */
.search-form-inline {
  margin-top: 5px;
}
```

- in app/templates/items.hbs replace all with:

```hbs
<div class="row mb-2">
  <div class="col-9">
    <h2>Your search for "{{q}}" yielded {{model.total}} items</h2>
  </div>
  <div class="col-3">
    {{ago-search q=q onSearch=(action "doSearch") class="search-form-inline" size="sm"}}
  </div>
</div>
```

## Add an items service

- `ember g service items-service`
- restart the ember server (`ctrl-c / ember s`)
- add the fake `search` method to the service:

```js
search(q) {
  return {
    "query": q,
    "total": 1408,
    "start": 1,
    "num": 10,
    "nextStart": 11,
    "results": [{
      "id": "27467c140c9b4aea90b9b327a22f1675",
      "owner": "EsriMedia",
      "created": 1389830710000,
      "modified": 1389917598000,
      "type": "Web Map",
      "title": "Beer Spending"
    }, {
      "id": "927b9b1acbed4e9592c79a2d876c6c5c",
      "owner": "EsriMedia",
      "created": 1391208130000,
      "modified": 1391226848000,
      "type": "Map Service",
      "title": "Super_Bowl_Beer"
    }, {
      "id": "07a5810edbb847858e82b7c0fd1623a7",
      "owner": "3918",
      "created": 1378993854000,
      "modified": 1408632978000,
      "type": "Feature Service",
      "title": "Brewers_of_Ohio"
    }, {
      "id": "d710e7f6304e4bfabdd325acaea67687",
      "owner": "Paul2573",
      "created": 1317183218000,
      "modified": 1340642545000,
      "type": "Web Map",
      "title": "Great American Beer Festival Exhibitors & Regions"
    }, {
      "id": "de56d53d741440158c8a2ab053c6474c",
      "owner": "EsriMedia",
      "created": 1391208131000,
      "modified": 1391226131000,
      "type": "Feature Service",
      "title": "Super_Bowl_Beer"
    }, {
      "id": "4c1d7d082b53404cafa9183ecc6c4520",
      "owner": "EsriMedia",
      "created": 1474903833000,
      "modified": 1479133217000,
      "type": "Web Mapping Application",
      "title": "Tampa Bay Beer Drinking Habits"
    }, {
      "id": "9ffb804c63184c73892080f171e40c69",
      "owner": "complot",
      "created": 1459695423000,
      "modified": 1488111152000,
      "type": "Web Map",
      "title": "beer_sheva2"
    }, {
      "id": "9a2e589d0db441429d23c10b7b26982d",
      "owner": "dclancy4",
      "created": 1360687160000,
      "modified": 1360705495000,
      "type": "Web Mapping Application",
      "title": "NJ Breweries & Beer Events"
    }, {
      "id": "1dec28199f19404c8c551155736e05e0",
      "owner": "vladivoj",
      "created": 1376945919000,
      "modified": 1377038441000,
      "type": "Web Map",
      "title": "My beer map"
    }, {
      "id": "7c54f5a614e9441092930b0beca5eef6",
      "owner": "joethebeekeeper",
      "created": 1372739018000,
      "modified": 1405720465000,
      "type": "Web Map",
      "title": "Redding Beer Week"
    }]
  };
}
```

- in app/routes/items.js replace contents with:

```js
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  // from ember-arcgis-portal-services
  itemsService: service('items-service'),

  // changes to these query parameter will cause this route to
  // update the model by calling the "model()" hook again
  queryParams: {
    q: { refreshModel: true }
  },

  // the model hook is used to fetch any data based on route parameters
  model (params) {
    const itemsService = this.get('itemsService');
    const q = params.q || '*';
    return itemsService.search({ q });
  }
});
```

### Notes:
- service & injection
- model hook

## Display the results

- open app/templates/items.hbs and add:

```hbs
<div class="row">
  <div class="col-12">
    <table class="table table-striped table-bordered table-hover">
      <thead class="thead-dark">
        <tr>
          <th>Title</th>
          <th>Type</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        {{#each model.results as |item|}}
          <tr>
            <td>{{item.title}}</td>
            <td>{{item.type}}</td>
            <td>{{item.owner}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>
  </div>
</div>
```

- observe that we now see search results (that are always the same regardless of what you search for)

### Notes:
- Data binding to a collection
- `each` helper

## Refactor to use a results-item component

- `ember g component results-item`
- open app/templates/components/results-item.hbs and replace its contents with:

```hbs
<td>{{model.title}}</td>
<td>{{model.type}}</td>
<td>{{model.owner}}</td>
```

- open app/components/results-item.js and add:

```js
tagName: 'tr'
```

- open app/templates/items.hbs and replace the second `tr` and its contents with:

```hbs
{{results-item model=item}}
```

App should look/work the same.

### Notes:
- tagName (customizing the element)

## Component tests

- `ember t -s`
- note that 2 tests fail (these are tests that ember-cli generated for you when it generated your components)
- open tests/integration/components/results-item-test.js and replace its contents with:

```js
import { module, test } from 'qunit';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | results-item', function(hooks) {
  setupRenderingTest(hooks);

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
```

Note that only one test fails.

- open tests/integration/components/ago-search-test.js and replace its contents with:

```js
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ago-search', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // fail if onSearch callback was not called
    assert.expect(3);

    // Set any properties with this.set('myProperty', 'value');
    this.set('q', 'some initial search text');

    // test double for the action
    this.set('doSearch', q => {
      assert.equal(q, 'test', 'updated value was passed up');
    });

    // render component to the page
    await render(hbs`{{ago-search q=q onSearch=(action doSearch)}}`);

    // inital dom state
    assert.equal(this.$('input').val().trim(), this.get('q'), 'initial value is set');
    assert.equal(this.$('.input-group-lg').length, 0, 'no size by default');

    // change the value and click the search button
    // NOTE: this will trigger onSearch action and above assertion
    await fillIn('input', 'test');
    await click('button');
  });

  test('can set size', async function (assert) {
    // test double for the action
    this.set('doSearch', () => {});
    // render component to the page
    await render(hbs`{{ago-search onSearch=(action doSearch) size="lg"}}`);
    assert.equal(this.$('.input-group-lg').length, 1, 'set proper size');
  });
});
```

Note that all tests pass.

## Extend acceptance test

- add the following assertion to our acceptance test:

```js
assert.equal(findAll('table tbody tr').length, 10);
```

- Note that you will need to add `findAll` to the import from '@ember/test-helpers'
- verify that all tests pass

### Notes:
- component integration tests
- more acceptance tests
