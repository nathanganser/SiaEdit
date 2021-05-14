<template>
  <div class="side-bar__panel side-bar__panel--menu">
    <div class="side-bar__info">
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-if="loginToken">
        <div class="menu-entry__icon menu-entry__icon--image">
          <user-image :user-id="userId"></user-image>
        </div>
        <span>Signed in as <b>{{loginToken.name}}</b>.</span>
      </div>
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-if="syncToken">
        <div class="menu-entry__icon menu-entry__icon--image">
          <icon-provider :provider-id="currentWorkspace.providerId"></icon-provider>
        </div>
        <span v-if="currentWorkspace.providerId === 'googleDriveAppData'">
          <b>{{currentWorkspace.name}}</b> synced with your Google Drive app data folder.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'skyIdWorkspaceData'">
          <b>{{currentWorkspace.name}}</b> synced with your SkyDB.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'googleDriveWorkspace'">
          <b>{{currentWorkspace.name}}</b> synced with a <a :href="workspaceLocationUrl" target="_blank">Google Drive folder</a>.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'couchdbWorkspace'">
          <b>{{currentWorkspace.name}}</b> synced with a <a :href="workspaceLocationUrl" target="_blank">CouchDB database</a>.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'githubWorkspace'">
          <b>{{currentWorkspace.name}}</b> synced with a <a :href="workspaceLocationUrl" target="_blank">GitHub repo</a>.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'gitlabWorkspace'">
          <b>{{currentWorkspace.name}}</b> synced with a <a :href="workspaceLocationUrl" target="_blank">GitLab project</a>.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'skyIdWorkspace'">
          <b>{{currentWorkspace.name}}</b> synced with SkyDB.
        </span>
        <span v-else-if="currentWorkspace.providerId === 'mySkyWorkspace'">
          <b>{{currentWorkspace.name}}</b> synced with SkyDB.
        </span>
      </div>
      <div class="menu-entry menu-entry--info flex flex--row flex--align-center" v-else>
        <div class="menu-entry__icon menu-entry__icon--disabled">
          <icon-sync-off></icon-sync-off>
        </div>
        <span><b>{{currentWorkspace.name}}</b> not synced.</span>
      </div>
    </div>
    <menu-entry v-if="loginToken" @click.native="remove(currentWorkspace)">
      <icon-logout slot="icon"></icon-logout>
      <div v-if="currentWorkspace.providerId === 'skyIdWorkspace'">
        Logout of SkyID
      </div>
      <div v-else-if="currentWorkspace.providerId === 'mySkyWorkspace'">
        Logout of MySky
      </div>
    </menu-entry>
    <menu-entry v-if="!loginToken" @click.native="signin('skyId')">
      <icon-login slot="icon"></icon-login>
      <div>Sign in with SkyID</div>
      <span>Sync your main workspace and unlock functionalities.</span>
    </menu-entry>
    <menu-entry v-if="!loginToken" @click.native="signin('mySky')">
      <icon-login slot="icon"></icon-login>
      <div>Sign in with MySky</div>
      <span>Sync your main workspace and unlock functionalities.</span>
    </menu-entry>
    <!-- <menu-entry @click.native="setPanel('workspaces')">
      <icon-database slot="icon"></icon-database>
      <div><div class="menu-entry__label menu-entry__label--count" v-if="workspaceCount">{{workspaceCount}}</div> Workspaces</div>
      <span>Switch to another workspace.</span>
    </menu-entry> -->
    <hr>
    <menu-entry @click.native="setPanel('sync')">
      <icon-sync slot="icon"></icon-sync>
      <div><div class="menu-entry__label menu-entry__label--count" v-if="syncLocationCount">{{syncLocationCount}}</div> Synchronize</div>
      <span>Sync your files in the Cloud.</span>
    </menu-entry>
    <menu-entry @click.native="publish">
      <icon-upload slot="icon"></icon-upload>
      <div><div class="menu-entry__label menu-entry__label--count" v-if="publishLocationCount">{{publishLocationCount}}</div>Publish</div>
      <span>Export your files to the web.</span>
    </menu-entry>
    <menu-entry @click.native="setPanel('history')">
      <icon-history slot="icon"></icon-history>
      <div>History</div>
      <span>Track and restore file revisions.</span>
    </menu-entry>
    <menu-entry @click.native="fileProperties">
      <icon-view-list slot="icon"></icon-view-list>
      <div>File properties</div>
      <span>Add metadata and configure extensions.</span>
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('toc')">
      <icon-toc slot="icon"></icon-toc>
      Table of contents
    </menu-entry>
    <menu-entry @click.native="setPanel('help')">
      <icon-help-circle slot="icon"></icon-help-circle>
      Markdown cheat sheet
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('importExport')">
      <icon-content-save slot="icon"></icon-content-save>
      Import/export
    </menu-entry>
    <menu-entry @click.native="print">
      <icon-printer slot="icon"></icon-printer>
      Print
    </menu-entry>
    <hr>
    <menu-entry @click.native="badges">
      <icon-seal slot="icon"></icon-seal>
      <div><div class="menu-entry__label menu-entry__label--count">{{badgeCount}}/{{featureCount}}</div> Badges</div>
      <span>List application features and earned badges.</span>
    </menu-entry>
    <!-- <menu-entry @click.native="accounts">
      <icon-key slot="icon"></icon-key>
      <div><div class="menu-entry__label menu-entry__label--count">{{accountCount}}</div> Accounts</div>
      <span>Manage access to your external accounts.</span>
    </menu-entry> -->
    <menu-entry @click.native="templates">
      <icon-code-braces slot="icon"></icon-code-braces>
      <div><div class="menu-entry__label menu-entry__label--count">{{templateCount}}</div> Templates</div>
      <span>Configure Handlebars templates for your exports.</span>
    </menu-entry>
    <menu-entry @click.native="settings">
      <icon-settings slot="icon"></icon-settings>
      <div>Settings</div>
      <span>Tweak application and keyboard shortcuts.</span>
    </menu-entry>
    <hr>
    <menu-entry @click.native="setPanel('workspaceBackups')">
      <icon-content-save slot="icon"></icon-content-save>
      Workspace backups
    </menu-entry>
    <menu-entry @click.native="reset">
      <icon-logout slot="icon"></icon-logout>
      Reset application
    </menu-entry>
    <menu-entry @click.native="about">
      <icon-help-circle slot="icon"></icon-help-circle>
      About SiaEdit
    </menu-entry>
  </div>
</template>

<script>
/* eslint-disable */

import { mapGetters, mapActions } from 'vuex';
import MenuEntry from './common/MenuEntry';
import providerRegistry from '../../services/providers/common/providerRegistry';
import UserImage from '../UserImage';
import skyIdHelper from '../../services/providers/helpers/skyIdHelper';
import mySkyHelper from '../../services/providers/helpers/mySkyHelper';
import googleHelper from '../../services/providers/helpers/googleHelper';
import syncSvc from '../../services/syncSvc';
import userSvc from '../../services/userSvc';
import exportSvc from '../../services/exportSvc';
import badgeSvc from '../../services/badgeSvc';
import store from '../../store';
import utils from '../../services/utils';

export default {
  components: {
    MenuEntry,
    UserImage,
  },
  computed: {
    ...mapGetters('workspace', [
      'currentWorkspace',
      'syncToken',
      'loginToken',
    ]),
    userId() {
      return userSvc.getCurrentUserId();
    },
    workspaceLocationUrl() {
      const provider = providerRegistry.providersById[this.currentWorkspace.providerId];
      return provider.getWorkspaceLocationUrl(this.currentWorkspace);
    },
    workspaceCount() {
      return Object.keys(store.getters['workspace/workspacesById']).length;
    },
    syncLocationCount() {
      return Object.keys(store.getters['syncLocation/currentWithWorkspaceSyncLocation']).length;
    },
    publishLocationCount() {
      return Object.keys(store.getters['publishLocation/current']).length;
    },
    templateCount() {
      return Object.keys(store.getters['data/allTemplatesById']).length;
    },
    accountCount() {
      return Object.values(store.getters['data/tokensByType'])
        .reduce((count, tokensBySub) => count + Object.values(tokensBySub).length, 0);
    },
    badgeCount() {
      return store.getters['data/allBadges'].filter(badge => badge.isEarned).length;
    },
    featureCount() {
      return store.getters['data/allBadges'].length;
    },
  },
  methods: {
    ...mapActions('data', {
      setPanel: 'setSideBarPanel',
    }),
    async signin(provider) {
      try {
        if(provider == 'skyId')await skyIdHelper.addAccount(true, true);
        else await mySkyHelper.addAccount(true, true);
      } catch (e) {
        // Cancel
      }
    },
    async fileProperties() {
      try {
        await store.dispatch('modal/open', 'fileProperties');
      } catch (e) {
        // Cancel
      }
    },
    print() {
      window.print();
    },
    async settings() {
      try {
        await store.dispatch('modal/open', 'settings');
      } catch (e) { /* Cancel */ }
    },
    async templates() {
      try {
        await store.dispatch('modal/open', 'templates');
      } catch (e) { /* Cancel */ }
    },
    async accounts() {
      try {
        await store.dispatch('modal/open', 'accountManagement');
      } catch (e) { /* Cancel */ }
    },
    async badges() {
      try {
        await store.dispatch('modal/open', 'badgeManagement');
      } catch (e) { /* Cancel */ }
    },
    async reset() {
      try {
        await store.dispatch('modal/open', 'reset');
        localStorage.setItem('resetStackEdit', '1');
        window.location.reload();
      } catch (e) { /* Cancel */ }
    },
    about() {
      store.dispatch('modal/open', 'about');
    },
    async publish() {
       const currentFile = store.getters['file/current'];
       const allTemplatesById = store.getters['data/allTemplatesById'];
       try {
       const url = await exportSvc.exportToSkynet(currentFile.id, 'html', allTemplatesById['styledHtml']);
       if(this.currentWorkspace.providerId == 'mySkyWorkspace') await mySkyHelper.publishDAC(url);
       window.open(url);
       badgeSvc.addBadge('exportHtml');
     } catch (e) { /* Cancel */ }
    },
    async remove(entry) {
      if(entry.providerId == 'skyIdWorkspace') entry.providerId = 'skyId';
      else entry.providerId = 'mySky';
      const tokensBySub = utils.deepCopy(store.getters[`data/${entry.providerId}TokensBySub`]);
      delete tokensBySub[entry.sub];
      await store.dispatch('data/patchTokensByType', {
        [entry.providerId]: tokensBySub,
      });
      if (entry.providerId === 'skyId')skyIdHelper.removeAccount();
      else if (entry.providerId === 'mySky')mySkyHelper.removeAccount();
      badgeSvc.addBadge('removeAccount');
    },
  },
};
</script>
