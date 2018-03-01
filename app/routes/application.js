import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default Route.extend({
  intl: service(),
  beforeModel() {
    /* NOTE: if you lazily load translations, here is also where you would load them via `intl.addTranslations` */
    return this.get('intl').setLocale(['en-us']); /* array optional */
  }
});
