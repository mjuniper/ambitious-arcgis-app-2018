import Controller from '@ember/controller';

export default Controller.extend({

  actions: {
    doSearch (q) {
      // NOTE: don't need to pass route name b/c same route
      this.transitionToRoute('items', {
        queryParams: { q }
      });
    }
  }

});
