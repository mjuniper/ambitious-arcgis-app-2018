import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  classNames: ['search-form'],

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
  }),

  actions: {
    doSearch () {
      // calling template passed in an 'onSearch' function,
      // call it and pass the input's value
      if (this.onSearch) {
        this.onSearch(this.get('searchCopy'));
      }
    }
  }

});
