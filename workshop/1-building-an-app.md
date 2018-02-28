# Building an Application

## Scaffold the application

### Prerequisites

- node and npm - already installed
- ember-cli - already installed (if not, `npm install -g ember-cli`)
- Git - already installed on mac, windows users can download https://git-scm.com/download/win

### Ember new

- open a terminal to the root folder where you keep your projects and enter:
```shell
ember new ambitious-arcgis-app
cd ambitious-arcgis-app
```

### Run the app
- in your terminal, enter
```shell
ember serve
```
- open a browser to http://localhost:4200/

### Add some markup and CSS

- `npm uninstall ember-welcome-page --save-dev`
- restart ember server:
  - `ctrl-c`
  - `ember s`
- open app/styles/app.scss and add

```css
/* bootstrap styles */
@import "ember-bootstrap/bootstrap";

body {
  padding-top: 3.5rem;
}
```

- open app/templates/application.hbs replace its contents with:

```hbs
<nav class="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
  <a class="navbar-brand" href="#">Ambitious ArcGIS App</a>
</nav>

<div class="container mt-5">
  {{outlet}}
</div>
```

#### Notes:
- application route/template
- handlebars/templating
- nested routes and {{outlet}}
- compiled css, js

## Scaffold some routes

### Add items route
- `ember generate route items`
- open app/routes/items.js and replace its contents with:

```js
import Route from '@ember/routing/route';

export default Route.extend({
  // changes to these query parameter will cause this route to
  // update the model by calling the "model()" hook again
  queryParams: {
    q: { refreshModel: true }
  },

  // the model hook is used to fetch any data based on route parameters
  model (/* params */) {
    // TODO: search for items using the search term and item type
    return {
      total: 0,
      results: []
    };
  }
});
```

- open app/templates/items.hbs and replace its contents with:

```hbs
<h2>Your search for "{{q}}" yielded {{model.total}} items</h2>
```

- visit http://localhost:4200/items?q=test

#### Notes:
- generators
- route lifecycle hooks: model
- data binding
- ember object, get, set, extend, CPs - [ember twiddle](https://ember-twiddle.com/38e642b4a4f9b5ea748965f0bd9152ab?fileTreeShown=false&numColumns=2&openFiles=routes.application.js%2Ccontrollers.application.js)

### Add index route
- `ember generate route index`
- Download https://livingatlas.arcgis.com/assets/img/background-banners/Banner9.jpg and save at /public/assets/images/Banner9.jpg
- open app/styles/app.css and add:

```css
/* index */
.jumbotron-hero {
  background: linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(./images/Banner9.jpg) center top/cover no-repeat;
}
.jumbotron-hero h1 {
  color:#fff;
  text-shadow: 0 3px 2px rgba(0,0,0,0.75);
  text-align: center;
  padding-bottom: 40px;
  border-bottom: 1px solid #fff;
  margin-bottom: 40px;
}
```

- open app/index/template.hbs and replace its contents with:

```hbs
<!-- Main component for a primary marketing message or call to action -->
<div class="jumbotron jumbotron-hero">
  <h1>Ambitious ArcGIS App</h1>
  <form {{action "doSearch" on="submit"}}>
    <div class="input-group input-group-lg">
      {{input class="form-control" placeholder="search for items" value=q}}
      <span class="input-group-btn">
        <button class="btn btn-default" type="submit">
          <span class="glyphicon glyphicon-search" aria-hidden="true"></span>
        </button>
      </span>
    </div>
  </form>
</div>
```

- open up app/application/template.hbs and add the following immediately above this line: `</div><!--/.container-fluid -->`:

```hbs
<ul class="nav navbar-nav">
  <li>{{#link-to "index" }}Home{{/link-to}}</li>
  <li>{{#link-to "items" }}Items{{/link-to}}</li>
</ul>
```

### Add index controller
- `ember g controller index`
- open app/index/controller.js and add the following to the controller definition:

```js
actions: {
  doSearch () {
    const q = this.get('q');
    this.transitionToRoute('items', {
      queryParams: { q }
    });
  }
}
```

- click on the home link and enter search terms

#### Notes:
- helpers - link-to & input
- actions
- ember inspector

## Add an acceptance test

- `ember g acceptance-test smoke`
- open tests/acceptance/smoke-test.js and replace its contents with:

```js
import { test } from 'qunit';
import moduleForAcceptance from 'ambitious-arcgis-app/tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | smoke test');

test('smoke-test', function(assert) {
  visit('/');

  andThen(function () {
    assert.equal(currentURL(), '/');
  });

  fillIn('form .input-group input', 'water');
  click('form .input-group button');

  andThen(function () {
    assert.equal(currentURL(), '/items?q=water');
  });
});
```

- `ember test -s`
- verify that all tests pass

#### Notes:
- testing
