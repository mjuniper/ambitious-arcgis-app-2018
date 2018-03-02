import config from '../config/environment';
import coordsToExtent from '../utils/map/coords-to-extent';
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
    // create a map at this element's DOM node
    mapService.newMap(this.elementId, config.APP.map.options)
    .then(() => {
      this.showItemsOnMap();
    });
  },

  // whenever items change, update the map
  didUpdateAttrs () {
    this.showItemsOnMap();
  },

  // show new item extents on map
  showItemsOnMap () {
    const { symbol, popupTemplate } = config.APP.map.itemExtents;
    const jsonGraphics = this.get('items').map(item => {
      const geometry = coordsToExtent(item.extent);
      return { geometry, symbol, attributes: item, popupTemplate };
    });
    this.get('mapService').refreshGraphics(jsonGraphics);
  },

  // destroy the map before this component is removed from the DOM
  willDestroyElement () {
    this._super(...arguments);
    const mapService = this.get('mapService');
    mapService.destroyMap();
  }
});
