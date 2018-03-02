# Maps

## Adding a basic map using ember-esri-loader

- stop app (`cmd+C`)

- `ember install ember-esri-loader`

- in app/styes/app.css
 - add the following to the top of the file:
```css
/* esri styles */
@import url('https://js.arcgis.com/4.6/esri/css/main.css');
```
 - and add the following at the end:

 ```css
 /* map */
 .extents-map {
   height: 300px;
   margin-bottom: 20px;
 }
 ```

- `ember s`
- `ember g service map-service`
- `ember g component extents-map`
- `rm app/templates/components/extents-map.hbs`
- replace contents of app/services/map-service.js with

```js
import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  esriLoader: service('esri-loader'),
  // create a new map object at an element
  newMap(element, mapOptions) {
    // load the map modules
    this.get('esriLoader').loadModules(['esri/Map', 'esri/views/MapView'])
    .then(([Map, MapView]) => {
      if (!element || this.get('isDestroyed') || this.get('isDestroying')) {
        // component or app was likely destroyed
        return;
      }
      // Create the Map
      var map = new Map(mapOptions);
      // show the map at the element
      this._view = new MapView({
        map,
        container: element,
        zoom: 2
      });
    });
  },

  // destroy the map if it was already created
  destroyMap() {
    if (this._view) {
      delete this._view;
    }
  }
});
```

- replace contents of app/components/extents-map.js with:

```js
import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames: ['extents-map'],

  mapService: service('map-service'),

  // wait until after the component is added to the DOM before creating the map
  didInsertElement () {
    this._super(...arguments);
    // create a map at this element's DOM node
    const mapService = this.get('mapService');
    mapService.newMap(this.elementId, { basemap: 'gray' });
  },

  // destroy the map before this component is removed from the DOM
  willDestroyElement () {
    this._super(...arguments);
    const mapService = this.get('mapService');
    mapService.destroyMap();
  }
});
```

- in app/templates/items.hbs add `{{extents-map}}` above the table

- go to the items route,

Notice that:
- you should see a map

### Bonus - map component test

Goal: stub the map service so we don't create a map when testing

- `ember install ember-sinon-qunit`
- in tests/integration/components/extents-map-test.js:
 - replace `import { module, test } from 'qunit';` with:

```js
import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';
```

- replace the contents of the 'it renders' test with:

```js
// stub the newMap() function so that a map is not constructed
const mapService = this.owner.lookup('service:map-service');
const stub = this.stub(mapService, 'newMap');

// Set any properties with this.set('myProperty', 'value');
// Handle any actions with this.set('myAction', function(val) { ... });

await render(hbs`{{extents-map}}`);

assert.ok(stub.calledOnce, 'newMap was called once');
```

- run `ember t -s`
- open chrome devtools, inspect network requests

Notice that:
- all tests pass
- no network requests are made for JSAPI

## Showing item extents on the map

### Logic
Once the map has loaded, and whenever map component's items are updated:
- clear map graphics
- loop through items, and for each
 - create a `new Graphic()` from the item
 - add the graphic to the map

2 sets of async state: Application (Ember) and map:
- each has own lifecyle (event)
- up to developer to keep 2 sets of state in sync.

Converting item to a [Graphic](https://developers.arcgis.com/javascript/latest/sample-code/intro-graphics/index.html):
- get `geometry` by converting item `extent` from coordinate array to extent JSON
- get `attributes` from item `title` and `snippet`
- get `infoTemplate` and `symbol` from config

### Add a utility function to transform extent

- `ember g util map/coords-to-extent`

- run tests w/ `ember test -s`

- in tests/unit/utils/map/coords-to-extent-test.js:
 - remove the unused `hooks` argument from the `module()` callback function
 - replace the existing `test()` with the following:
```js
test('it works', function(assert) {
  const coords = [[-53.2316, -79.8433], [180, 79.8433]];
  let result = mapCoordsToExtent(coords);
  assert.deepEqual(result, {
    xmin: -53.2316,
    ymin: -79.8433,
    xmax: 180,
    ymax: 79.8433,
    spatialReference:{
      wkid:4326
    }
  });
});

test('it handles invalid coords', function(assert) {
  let result = mapCoordsToExtent([]);
  assert.equal(result, undefined);
});
```

- replace app/utils/map/coords-to-extent.js content with:

```js
// expect [[-53.2316, -79.8433], [180, 79.8433]] or []
export default function mapCoordsToExtent (coords) {
  if (coords && coords.length === 2) {
    return {
      type: 'extent',
      xmin: coords[0][0],
      ymin: coords[0][1],
      xmax: coords[1][0],
      ymax: coords[1][1],
      spatialReference:{
        wkid:4326
      }
    };
  }
}
```

- stop tests by typing `q`

### Update the map service
Add a function to the map service that let's the component add graphics to the map.
- in app/services/map-service.js:
 - replace the contents of `newMap` with:

```js
// load the map modules
// load the map modules
return this.get('esriLoader').loadModules(['esri/Map', 'esri/views/MapView', 'esri/Graphic'])
.then(([Map, MapView, Graphic]) => {
  if (!element || this.get('isDestroyed') || this.get('isDestroying')) {
    // component or app was likely destroyed
    return;
  }
  // create function to return new graphics
  this._newGraphic = (jsonGraphic) => {
    return new Graphic(jsonGraphic);
  };
  var map = new Map(mapOptions);
  // show the map at the element and
  // hold on to the view reference for later operations
  this._view = new MapView({
    map,
    container: element,
    zoom: 2
  });
  return this._view.when(() => {
    this._view.on("mouse-wheel", function(evt){
      // prevents zooming with the mouse-wheel event
      evt.stopPropagation();
    });
    // let the caller know that the map is available
    return;
  });
});
```

- then add this method:

```js
// clear and add graphics to the map
refreshGraphics (jsonGraphics) {
  const view = this._view;
  if (!view || !view.ready) {
    return;
  }
  // clear any existing graphics
  view.graphics.removeAll();
  // convert json to graphics and add to map's graphic layer
  if (!jsonGraphics || jsonGraphics.length === 0) {
    return;
  }
  jsonGraphics.forEach(jsonGraphic => {
    view.graphics.add(this._newGraphic(jsonGraphic));
  });
},
```

- run `ember s`

Notice that:
- the app functions the same as before (our changes didn't break anything)

### Add configuration parameters
Before we add the code to show graphics, let's put any optional parameters into the application config.
- stop app if running (`cmd+C`)
- in config/environment.js add this to `APP`:

```js
map: {
  options: {
    basemap: 'gray'
  },
  itemExtents: {
    symbol: {
      color: [51, 122, 183, 0.125],
      outline: {
        color: [51, 122, 183, 1],
        width: 1,
        type: 'simple-line',
        style: 'solid'
      },
      type: 'simple-fill',
      style: 'solid'
    },
    popupTemplate: {
      title: '{title}',
      content: '{snippet}'
    }
  }
}
```

### Update map component

- run `ember s`

- in app/templates/items.hbs pass the items to the map component by updati the `extents-map` invocation to:
`{{extents-map items=model.results}}`

- in app/components/extents-map.js add these `import` statements

```js
import config from '../config/environment';
import coordsToExtent from '../utils/map/coords-to-extent';
```

- then add this method:

```js
// show new item extents on map
showItemsOnMap () {
  const { symbol, popupTemplate } = config.APP.map.itemExtents;
  const jsonGraphics = this.get('items').map(item => {
    const geometry = coordsToExtent(item.extent);
    return { geometry, symbol, attributes: item, popupTemplate };
  });
  this.get('mapService').refreshGraphics(jsonGraphics);
},
```

- then update contents of `didInsertElement()` to:

```js
this._super(...arguments);
// create a map at this element's DOM node
const mapService = this.get('mapService');
// create a map at this element's DOM node
mapService.newMap(this.elementId, config.APP.map.options)
.then(() => {
  this.showItemsOnMap();
});
```

- visit the items route

Notice that:
- the extents appear on the map
- you can click on one and see the popup
- but they don't update when you change the query, or page, so

back in app/components/extents-map/component.js add this method:

```js
// whenever items change, update the map
didUpdateAttrs () {
  this.showItemsOnMap();
},
```

- try searching, paging, navigating back to home and searching from there

Notice that:
- see th extents on the map change when you change query/page
