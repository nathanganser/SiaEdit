<template>
  <modal-inner aria-label="Synchronize with SkyDB">
    <div class="modal__content">
      <div class="modal__image">
        <icon-provider provider-id="skyId"></icon-provider>
      </div>
      <p>Open a file from your <b>SkyDB</b> and keep it synced.</p>
      <form-entry label="Filename" error="filename">
        <input slot="field" class="textfield" type="text" v-model.trim="filename" @keydown.enter="resolve()">
      </form-entry>
    </div>
    <div class="modal__button-bar">
      <button class="button" @click="config.reject()">Cancel</button>
      <button class="button button--resolve" @click="resolve()">Ok</button>
    </div>
  </modal-inner>
</template>

<script>
import skyIdProvider from '../../../services/providers/skyIdProvider';
import modalTemplate from '../common/modalTemplate';

export default modalTemplate({
  data: () => ({
    filename: '',
  }),
  created() {
    this.filename = `${this.currentFileName}`;
  },
  methods: {
    resolve() {
      if (!this.filename) {
        this.setError('filename');
      } else {
        // Return new location
        const location = skyIdProvider.makeLocation(this.config.token, this.filename);
        this.config.resolve(location);
      }
    },
  },
});
</script>
