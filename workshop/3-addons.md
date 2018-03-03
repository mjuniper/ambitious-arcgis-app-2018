# Addons

Previously we added the Bootstrap CSS, which works for the page layout and styles, but the components are not interactive. For example, open chrome developer tools (cmd+opt+i) and toggle the device toolbar (cmd+shift+M) to view what the app looks like on a mobile device.

Notice that:
- the nav menu items are hidden
- we can't get back to the home page

We'll need to add bootstrap's button to toggle the collapsible nav bar.

The easiest way is to use http://www.ember-bootstrap.com/, which is an ember implementation of most Bootstrap components.

## Add ember-bootstrap
- stop app (`ctrl+C`)
- `ember install ember-bootstrap`
- configure to use the latest Bootstrap (v4) by running:
`ember generate ember-bootstrap --bootstrap-version=4`
- in app/styles/app.css, delete this line:
`@import "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css";`
- start app (`ember serve`)

Notice that:
- app looks the same
- no longer making a network request for bootstrap.min.css from CDN
- bootstrap styles have been imported into vendor.css
- the navbar toggle on mobile still doesn't work

## Use ember-bootstrap components
- in app/templates/application.hbs replace the `<nav>` with:

```hbs
{{#bs-navbar class="navbar-expand-md navbar-dark fixed-top bg-dark" as |navbar|}}
  <div class="navbar-header">
    {{navbar.toggle}}
    <a class="navbar-brand" href="#">Ambitious ArcGIS App</a>
  </div>
  {{#navbar.content}}
    {{#navbar.nav as |nav|}}
      {{#nav.item}}
        {{#nav.link-to "index"}}Home{{/nav.link-to}}
      {{/nav.item}}
      {{#nav.item}}
        {{#nav.link-to "items"}}Items{{/nav.link-to}}
      {{/nav.item}}
    {{/navbar.nav}}
  {{/navbar.content}}
{{/bs-navbar}}
```

Notice that:
- you can now use the navbar toggle on mobile

## Add ember-arcgis-portal-services
- stop app (`ctrl+C`)
- first [install and configure torii-provider-arcgis](https://github.com/dbouwman/torii-provider-arcgis#usage):
 - `ember install torii`
 - `ember install torii-provider-arcgis`
 - in config/environment.js add the following above `APP`:

```js
torii: {
  sessionServiceName: 'session',
  providers: {
   'arcgis-oauth-bearer': {
      portalUrl: 'https://www.arcgis.com'
    }
  }
},
```

- `ember install ember-arcgis-portal-services`
- remove fake implementation of itemsService:
`ember destroy service items-service`
- `ember serve` and visit `localhost:4200`

Notice that:
- entering search terms returns real results!
- Only getting 10 though, so let's add paging

## Add paging parameters to routes and controllers
in app/routes/items.js:
- add these query paramters above the `q` param:

```js
// paging query params
start: { refreshModel: true },
num: { refreshModel: true },
```

- then update the `model()` hook as follows:

```js
return itemsService.search({ q, num: params.num, start: params.start });
```

in app/controllers/items.js:
- add this to the top of the controller:

```js
// query parameters used by components
queryParams: ['start', 'num'],
start: 1,
num: 10,
```

- in `transitionToRoute()` update the `queryParams` as follows:

```js
// for a new query string, sart on first page
queryParams: { q , start: 1 }
```

in app/controllers/index.js:
- in `transitionToRoute()` update the `queryParams` as follows:

```js
// for a new query string, sart on first page
queryParams: { q , start: 1 }
```

- run `ember serve`
- search for `water`
- append the following to query string: `&start=11&num=5` and hit enter
- play around w/ those parameters and see what happens

Notice that:
- you can control the number and starting point for results via query string params
- searching from a different term (either from home or items route) will reset the starting point, but not the number of records shown

## Bonus: add paging component
[ember-arcgis-portal-components](https://github.com/Esri/ember-arcgis-portal-components) has [a paging component you can use](https://esri.github.io/ember-arcgis-portal-components/#/itempicker/defaultcatalog). Those components are internationalized so first we install and configure [ember-intl](https://github.com/ember-intl/ember-intl):
- stop app (`ctrl+C`)
- `ember install ember-intl`
- we need to set the default locale before the app loads, best place is an application route:
`ember generate route application`
- **IMPORTANT: do NOT overwrite the existing app/templates/application.hbs file!**
- replace the content of app/routes/application.js with:

```js
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  intl: service(),
  beforeModel() {
    return this.get('intl').setLocale('en-us');
  }
});
```
- now we can install portal components addon: `ember install ember-arcgis-portal-components`

Let's add the `{{item-pager}}` in app/templates/items.hbs:
- add this below the `<table>`:

```hbs
{{item-pager
  pageSize=num
  totalCount=model.total
  pageNumber=pageNumber
  changePage=(action "changePage")
}}
```

in app/controllers/items.js:
- add this to the top of the file:
`import { computed } from '@ember/object';`

- add this below the `num: 10,` query parameter:

```js
// compute current page number based on start record
// and the number of records per page
pageNumber: computed('num', 'model.start', function () {
  const pageSize = this.get('num');
  const start = this.get('model.start');
  return ((start - 1) / pageSize) + 1;
}),
```

- add this to the actions above `doSearch`:

```js
changePage (page) {
  // calculate next start record based on
  // the number of records per page
  const pageSize = this.get('num');
  const nextStart = ((page - 1) * pageSize) + 1;
  this.set('start', nextStart);
},
```

- run `ember serve`

Notice that:
- there is a paging controller below the table that allows you to page through records

## Fix failing tests
ember-arcgis-portal-services has not been updated for Ember 3 yet, and it's causing the acceptance test to fail
- run `ember t -s`, you should see 3 failing tests
- filter on `!Acceptance`, and all tests should pass
- open tests/acceptance/smoke-test.js and:
 - add `, waitUntil` to the `import` from `'@ember/test-helpers'`
 - add `import { later } from '@ember/runloop';`
 - add the following _above_ the `assert` statements:

```js
// force the test to wait a bit longer
// this should not be necessary but appears to be... _sometimes_
let flag = false;
later(() => flag = true, 500);
await waitUntil(() => flag);
```

- remove the filter, and all tests should still be passing
- type `q` to stop the tests
