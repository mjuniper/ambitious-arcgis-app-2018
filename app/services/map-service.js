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
