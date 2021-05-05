<template>
  <modal-inner aria-label="Link MySky account">
    <div class="modal__content">
      <div class="modal__image">
        <icon-provider provider-id="mySky"></icon-provider>
      </div>
      <p>Link your <b>MySky</b> account to <b>SiaEdit</b>.</p>
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
      <button class="button button--resolve" @click="config.resolve()">Ok</button>
    </div>
  </modal-inner>
</template>

<script>
import modalTemplate from '../common/modalTemplate';

export default modalTemplate({
  computedLocalSettings: {
    noteAccess: 'skyIdNoteAccess',
  },
});
</script>
