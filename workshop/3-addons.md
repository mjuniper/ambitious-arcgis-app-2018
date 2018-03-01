# Addons

Previously we added the Bootstrap CSS, which works for the page layout and styles, but the components are not interactive. For example, open chrome developer tools (cmd+opt+i) and toggle the device toolbar (cmd+shift+M) to view what the app looks like on a mobile device.

Notice that:
- the nav menu items are hidden
- there is a navbar toggle in the uppper left corner
- clicking on it does not show the nav menu items

We'll need to add the bootstrap JS to get that interactivity.

The easiest way is to use http://www.ember-bootstrap.com/, which is an ember implementation of most Bootstrap components.

## Add ember-bootstrap
- stop app (`cmd+C`)
- `ember install ember-bootstrap`
- configure to use the latest Bootstrp (v4) by running:
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
- stop app (`cmd+C`)
- follow instructions here: https://github.com/dbouwman/torii-provider-arcgis#usage
- `ember install ember-arcgis-portal-services`
- in config/environment.js add:
```js
torii: {
  sessionServiceName: 'session',
  providers: {
   'arcgis-oauth-bearer': {
      portalUrl: 'https://www.arcgis.com'
    }
  }
}
```

- remove fake implementation of itemsService:
`ember destroy service items-service`

- `ember serve` and visit `localhost:4200`
- search enter search terms and see real results!

Only getting 10 though, so let's add paging

## Add paging components from ember-arcgis-portal-components
Our components are internationalize so first we install and configure [ember-intl](https://github.com/ember-intl/ember-intl):
- stop app (`cmd+C`)
- `ember install ember-intl`
- we need to set the default locale before the app loads, so we need an application route:
`ember generate route application`
- replace the content of app/routes/application.js with:

```js
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  intl: service(),
  beforeModel() {
    /* NOTE: if you lazily load translations, here is also where you would load them via `intl.addTranslations` */
    return this.get('intl').setLocale(['en-us']); /* array optional */
  }
});
```
- now we can install portal components addon: `ember install ember-arcgis-portal-components`
- in app/routes/items.js
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

- in app/controllers/index.js in `transitionToRoute()` update the query as follows:

```js
// for a new query string, sart on first page
queryParams: { q , start: 1 }
```

- in app/controllers/items.js
 - update the query as you did above
 - add this to the top of the controller:

```js
// query parameters used by components
queryParams: ['start', 'num'],
start: 1,
num: 10,
```

 - then add this to the actions:

```js
changePage (page) {
  this.set('start', page);
}
```

- in app/templates/items.hbs add this below the table:

```hbs
{{item-pager
  pageSize=num
  totalCount=model.total
  pageNumber=start
  useAriaLabels=false
  changePage=(action "changePage")
}}
```

- run `ember serve`

Notice that:
- there is a paging controller below the table that allows you to page through records
