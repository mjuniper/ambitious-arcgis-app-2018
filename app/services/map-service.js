import Service from '@ember/service';
import { inject as service } from '@ember/service';

export default Service.extend({
  esriLoader: service('esri-loader'),
  // create a new map object at an element
  newMap(element, mapOptions) {
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
  },

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

  // destroy the map if it was already created
  destroyMap() {
    if (this._view) {
      delete this._view;
    }
  }
});
