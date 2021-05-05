<template>
  <modal-inner aria-label="Add SkyDB workspace">
    <div  v-if="entries.length">
      {{resolve()}}
      <!-- <div class="modal__content">
        <div class="modal__image">
          <icon-provider provider-id="skyId"></icon-provider>
        </div>
        <p>Create a workspace synced with a <b>SkyDB</b> database.</p>
        <form-entry label="Database name" error="dbName">
          <input slot="field" class="textfield" type="text" v-model.trim="dbName" @keydown.enter="resolve()">
        </form-entry>
      </div>
      <div class="modal__button-bar">
        <button class="button" @click="config.reject()">Cancel</button>
        <button class="button button--resolve" @click="resolve()">Ok</button>
      </div> -->
    </div>
    <div v-else>
      <div class="modal__content">
        <div class="modal__image">
          <icon-provider provider-id="mySky"></icon-provider>
        </div>
        <p>Link your <b>MySky</b> account to <b>SiaEdit</b> first.</p>
        <!-- <div class="form-entry">
          <div class="form-entry__checkbox">
            <label>
              <input type="checkbox" v-model="noteAccess"> Grant access to your notes
            </label>
          </div>
        </div> -->
      </div>
      <div class="modal__button-bar">
        <button class="button" @click="config.reject()">Cancel</button>
        <button class="button button--resolve" @click="addMySkyAccount()">Ok</button>
      </div>
    </div>
  </modal-inner>
</template>

<script>
import { mapGetters } from 'vuex';
import modalTemplate from '../common/modalTemplate';
import utils from '../../../services/utils';
import store from '../../../store';
import mySkyHelper from '../../../services/providers/helpers/mySkyHelper';

export default modalTemplate({
  data: () => ({
    dbName: '',
  }),

  computed: {
    ...mapGetters('modal', [
      'config',
    ]),
    entries() {
      return [
        ...Object.values(store.getters['data/mySkyTokensBySub']).map(token => ({
          token,
          providerId: 'mySky',
          userId: token.sub,
          name: token.name,
        })),
      ];
    },
  },

  methods: {
    resolve() {
      const url = utils.addQueryParams('', {
        providerId: 'mySkyWorkspace',
        dbName: 'Main workspace',
      }, true);
      this.config.resolve();
      window.open(url);
    },
    async addMySkyAccount() {
      await mySkyHelper.addAccount(true);
    },
  },
});
</script>

<style lang="scss">
.couchdb-workspace__info {
  font-size: 0.8em;
}
</style>
