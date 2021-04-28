<template>
  <modal-inner aria-label="Insert image">
    <div class="modal__content">
      <p>Please provide a <b>URL</b> for your image.</p>
      <form-entry label="URL" error="url">
        <input slot="field" class="textfield" type="text" v-model.trim="url" @keydown.enter="resolve">
      </form-entry>
      <menu-entry @click.native="openGooglePhotos(token)" v-for="token in googlePhotosTokens" :key="token.sub">
        <icon-provider slot="icon" provider-id="googlePhotos"></icon-provider>
        <div>Open from Google Photos</div>
        <span>{{token.name}}</span>
      </menu-entry>
      <menu-entry @click.native="addGooglePhotosAccount">
        <icon-provider slot="icon" provider-id="googlePhotos"></icon-provider>
        <span>Add Google Photos account</span>
      </menu-entry>

      <a class="box-entry flex flex--row flex--align-center" v-cloak @drop.prevent="drop" @dragover.prevent>
        <div class="menu-entry__text flex flex--column">
          <input style="position: absolute; opacity:0; overflow:hidden" type="file" name="imgFile" id="imgFile" accept=".jpg,.jpeg,.png" />
          <span style="line-height:39px;" class = "drop-area" v-if="!uploading">
            Drop image here or <u>upload</u>
          </span>
          <span class = "drop-area" v-else>
            <div style="display: inline-block">
              <div style="float:left;" class="navigation-bar__spinner">
                <div class="spinner"></div>
              </div>
              <div style="float:left;height: 24px;margin-top: 7px;margin-left:2px">Processing...</div>
            </div>
          </span>
        </div>
      </a>

    </div>
    <div class="modal__button-bar">
      <button class="button" @click="reject()">Cancel</button>
      <button class="button button--resolve" @click="resolve">Ok</button>
    </div>
  </modal-inner>
</template>

<style lang="scss">
.box-entry {
  text-align: left;
  padding: 10px;
  margin-top: 10px;
  height: auto;
  font-size: 17px;
  line-height: 1.4;
  text-transform: none;
  white-space: normal;
  text-decoration: none;
  color: #333;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;

  .drop-area {
    display: inline-block;
    font-size: 0.75rem;
    opacity: 0.67;
    margin-top: 20px;
    margin-bottom: 20px;
    line-height: 24px;
    text-align: center;
    cursor: pointer;
  }
}

.menu-entry__text {
  width: 100%;
  overflow: hidden;
}

$r: 10px;
$d: $r * 2;
$b: $d/10;
$t: 3000ms;
$error-color: #333;
$navbar-bg: #333;
$navbar-color: mix($navbar-bg, #fff, 33%);

.navigation-bar__spinner {
  width: 24px;
  margin: 7px 0 0 8px;

  .icon {
    width: 24px;
    height: 24px;
    color: transparentize($error-color, 0.5);
  }
}

.spinner {
  width: $d;
  height: $d;
  display: block;
  position: relative;
  border: $b solid transparentize($navbar-color, 0.5);
  border-radius: 50%;
  margin: 2px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    display: block;
    width: $b;
    background-color: $navbar-color;
    border-radius: $b * 0.5;
    transform-origin: 50% 0;
  }

  &::before {
    height: $r * 0.4;
    left: $r - $b * 1.5;
    top: 50%;
    animation: spin $t linear infinite;
  }

  &::after {
    height: $r * 0.6;
    left: $r - $b * 1.5;
    top: 50%;
    animation: spin $t/4 linear infinite;
  }
}
</style>

<script>
/* eslint-disable */

import modalTemplate from './common/modalTemplate';
import MenuEntry from '../menus/common/MenuEntry';
import googleHelper from '../../services/providers/helpers/googleHelper';
import store from '../../store';
import exportSvc from '../../services/exportSvc';

export default modalTemplate({
  components: {
    MenuEntry,
  },
  data: () => ({
    url: '',
    uploading: false,
  }),
  computed: {
    googlePhotosTokens() {
      const googleTokensBySub = store.getters['data/googleTokensBySub'];
      return Object.values(googleTokensBySub)
        .filter(token => token.isPhotos)
        .sort((token1, token2) => token1.name.localeCompare(token2.name));
    },
  },
  methods: {
    resolve(evt) {
      evt.preventDefault(); // Fixes https://github.com/benweet/stackedit/issues/1503
      if (!this.url) {
        this.setError('url');
      } else {
        const { callback } = this.config;
        this.config.resolve();
        callback(this.url);
      }
    },
    reject() {
      const { callback } = this.config;
      this.config.reject();
      callback(null);
    },
    async addGooglePhotosAccount() {
      try {
        await googleHelper.addPhotosAccount();
      } catch (e) { /* cancel */ }
    },
    async openGooglePhotos(token) {
      const { callback } = this.config;
      this.config.reject();
      const res = await googleHelper.openPicker(token, 'img');
      if (res[0]) {
        store.dispatch('modal/open', {
          type: 'googlePhoto',
          url: res[0].url,
          callback,
        });
      }
    },
    async drop(event) {
      console.log('test');
      event.preventDefault();
      const file = event.dataTransfer.files[0];
      console.log(file.type);
      this.uploading = true;
      try {
        const url = await exportSvc.uploadToSkynet(file);
        this.url = url;
        this.uploading = false;
        //window.open(url);
      } catch (e) { /* Cancel */ }
    },
  },
});
</script>
