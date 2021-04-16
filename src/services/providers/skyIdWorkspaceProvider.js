/* eslint-disable */

import store from '../../store';
import skyIdHelper from './helpers/skyIdHelper';
import Provider from './common/Provider';
import utils from '../utils';
import badgeSvc from '../badgeSvc';

export default new Provider({
  id: 'skyIdWorkspace',
  name: 'SkyDB',
  getToken() {
    return store.getters['workspace/syncToken'];
  },
  getWorkspaceParams({ dbName }) {
    return {
      providerId: this.id,
      dbName,
    };
  },
  getWorkspaceLocationUrl({ dbName }) {
    return dbName;
  },
  getSyncDataUrl(fileSyncData, { id }) {
    const { dbName } = this.getToken();
    return `${dbName}`;
  },
  getSyncDataDescription(fileSyncData, { id }) {
    return id;
  },
  async initWorkspace() {
    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, ''); // Remove trailing /
    const workspaceParams = this.getWorkspaceParams({ dbName });
    const workspaceId = utils.makeWorkspaceId(workspaceParams);
    const workspace = store.getters['workspace/workspacesById'][workspaceId];

    let token;
    if (workspace) {
      console.log(workspace.sub);
      token = store.getters['data/skyIdTokensBySub'][workspace.sub];
    }

    if (!token) {
      token = store.getters['data/skyIdTokensBySub'][Object.keys(store.getters['data/skyIdTokensBySub'])[0]];
    }

    if (!workspace) {
      store.dispatch('workspace/patchWorkspacesById', {
        [workspaceId]: {
          id: workspaceId,
          name: dbName,
          providerId: this.id,
          sub: token.sub,
          dbName,
        },
      });
    }

    badgeSvc.addBadge('addSkyIdWorkspace');
    return store.getters['workspace/workspacesById'][workspaceId];
  },


  async getChanges() {
    const syncToken = store.getters['workspace/syncToken'];
    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, '');
    const result = await skyIdHelper.downloadNote({workspace: dbName});
    console.log("at getchanges");
    console.log(result);
    return result;
  },

  prepareChanges(changes) {

    console.log("Hereee: ");
    const workspace = store.getters['workspace/currentWorkspace'];
    const result = [];
    const found = {};

    changes.forEach((change) => {

      let contentChange;
      console.log(change);
        const item = {
          id: change.id,
          type: change.type,
          name: change.filename,
          parentId: change.parent,
        };

        found[change.filename] = true;
        change.item = utils.addItemHash(item);
        if (change.type === 'file') {
          const id = `${change.id}/content`;
          const syncDataId = `${change.filename}/content`;
          contentChange = {
            item: {
              id,
              type: 'content',
              hash: 1,
            },
            syncData: {
              id: syncDataId,
              itemId: id,
              type: 'content',
              hash: 1,
            },
            syncDataId,
          };
          found[syncDataId] = true;
        }

      change.syncData = {
        id: change.filename,
        itemId: change.item.id,
        parentIds: change.parent,
        type: change.item.type,
        hash: change.item.hash,
      };

      change.syncDataId = change.filename;
      result.push(change);
      if (contentChange) {
        result.push(contentChange);
      }
    });

    const syncDataByPath = store.getters['data/syncDataById'];
    console.log(syncDataByPath);
    Object.keys(syncDataByPath).forEach((path) => {
      if (!found[path]) {
        result.push({ syncDataId: path });
      }
    });

    return result;
  },

  onChangesApplied() {

  },

  async saveWorkspaceItem({ item, syncData }) {

    console.log("save item");
    console.log(item);
    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, '')
    const res = await skyIdHelper.uploadNote({
      filename: item.name,
      workspace: dbName,
      type: item.type,
      id: item.id,
      parent: item.parentId,
    });

    return {
      syncData: {
        id: item.name,
        itemId: item.id,
        type: item.type,
        parentIds: item.parentId,
        hash: item.hash,
      },
    };
  },

  async removeWorkspaceItem({ syncData }) {

    console.log("remove item");
    console.log(syncData.id);
    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, '')
    const res = await skyIdHelper.uploadNote({
      filename: syncData && syncData.id,
      workspace: dbName,
      type: syncData && syncData.type,
      parent: syncData && syncData.parentIds,
      id: syncData.itemId,
      remove: true,
    });

  },

  async downloadWorkspaceContent({ token, contentSyncData, fileSyncData }) {
    console.log("at downloadcontent");
    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, '');
    const filename = store.state.file.itemsById[fileSyncData.itemId].name;
    console.log(fileSyncData.parentIds);
    const body = await skyIdHelper.downloadNote({token, filename:fileSyncData.id, workspace:dbName, parent: fileSyncData.parentIds, type: fileSyncData.type, id: fileSyncData.itemId});
    const content = Provider.parseContent(body.file, contentSyncData.itemId);
    console.log("getting: ");
    console.log(body.file);

    return {
      content,
      contentSyncData: {
        ...contentSyncData,
        hash: content.hash,
      },
    };
  },

  async downloadWorkspaceData({ token, syncData }) {
    console.log("at downloaddata");
    if (!syncData) {
      return {};
    }
    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, '');
    const body = await skyIdHelper.downloadNote({token, filename: syncData.id, workspace:dbName, parent: '.stackedit-data', type: 'data', id: syncData.id});
    const item = utils.addItemHash(JSON.parse(body));
    return {
      item,
      syncData: {
        ...syncData,
        hash: item.hash,
      },
    };
  },

  async uploadWorkspaceContent({ token, content, contentSyncData, file, fileSyncData}) {

    console.log("upload content");

    let gdriveFile;
    let newFileSyncData;
    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, '')

    if (fileSyncData) {
      await skyIdHelper.uploadNote({
        token,
        file: Provider.serializeContent(content),
        filename: fileSyncData.id,
        id: file.id,
        parent: fileSyncData.parentIds,
        type: fileSyncData.type,
        workspace: dbName,
      });
    } else {
      await skyIdHelper.uploadNote({
        token,
        file: Provider.serializeContent(content),
        filename: file.name,
        id: file.id,
        parent: file.parentId,
        type: file.type,
        workspace: dbName,
      });

      newFileSyncData = {
        id: file.name,
        parentIds: file.parentId,
        itemId: file.id,
        type: file.type,
        hash: file.hash,
      };
    }

    // Return new sync data
    return {
      contentSyncData: {
        id: `${file.name}/content`,
        itemId: content.id,
        type: content.type,
        hash: content.hash,
      },
      fileSyncData: newFileSyncData,
    };
  },
  async uploadWorkspaceData({ token, item, syncData }) {

    console.log("upload data");

    const dbName = (utils.queryParams.dbName || '').replace(/\/?$/, '')
    const res = await skyIdHelper.uploadNote({
      file: JSON.stringify(item),
      filename: syncData.id,
      id: syncData.id,
      parent: '.stackedit-data',
      workspace: dbName,
      type: 'data',
    });

    return {
      syncData: {
        id: syncData.id,
        itemId: item.id,
        type: item.type,
        parent: item.parentId,
        hash: item.hash,
      },
    };
  },

});
