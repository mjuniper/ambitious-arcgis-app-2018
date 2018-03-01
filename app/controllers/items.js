import Controller from '@ember/controller';

export default Controller.extend({
  // query parameters used by components
  queryParams: ['start', 'num'],
  start: 1,
  num: 10,

  actions: {
    doSearch (q) {
      // NOTE: don't need to pass route name b/c same route
      this.transitionToRoute('items', {
        // for a new query string, sart on first page
        queryParams: { q , start: 1 }
      });
    },
    changePage (page) {
      this.set('start', page);
    }
  }

});
