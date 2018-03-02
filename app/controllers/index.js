import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    doSearch (q) {
      this.transitionToRoute('items', {
        queryParams: { q , start: 1 }
      });
    }
  }
});
