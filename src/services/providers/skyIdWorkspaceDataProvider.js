/* eslint-disable */

import store from '../../store';
import skyIdHelper from './helpers/skyIdHelper';
import Provider from './common/Provider';
import utils from '../utils';
import badgeSvc from '../badgeSvc';

export default new Provider({
  id: 'skyIdWorkspaceData',
  name: 'SkyDB',
  getToken() {
    return store.getters['workspace/syncToken'];
  },
  getWorkspaceParams({ dbName }) {
    return {};
  },
  getWorkspaceLocationUrl({ dbName }) {
    return null;
  },
  getSyncDataUrl(fileSyncData, { id }) {
    return null;
  },
  getSyncDataDescription(fileSyncData, { id }) {
    return id;
  },
  async initWorkspace() {
    return store.getters['workspace/workspacesById'].main;
  },

  async getChanges() {
    const syncToken = store.getters['workspace/syncToken'];
    const dbName = 'main';
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

      if (change.file) {
        // Parse item from file name
        try {
          change.item = JSON.parse(change.filename);
        } catch (e) {
          return false;
        }
        // Build sync data
        change.syncData = {
          id: change.item.id,
          itemId: change.item.id,
          type: change.item.type,
          hash: change.item.hash,
        };
      }
      change.syncDataId = change.filename;
      found[change.syncDataId] = true;
      result.push(change);
    });

    const syncDataByPath = store.getters['data/syncDataById'];
    console.log(syncDataByPath);
    Object.keys(syncDataByPath).forEach((path) => {
      if (!found[path]) {
        result.push({ syncDataId: path });
      }
    });

    console.log(result);
    return result;
  },

  onChangesApplied() {

  },

  async saveWorkspaceItem({ item, syncData }) {

    console.log("save item");
    console.log(item);
    const dbName = 'main';
    const res = await skyIdHelper.uploadNote({
      filename: JSON.stringify(item),
      workspace: dbName,
      type: item.type,
      id: item.id,
    });

    return {
      syncData: {
        id: JSON.stringify(item),
        itemId: item.id,
        type: item.type,
        hash: item.hash,
      },
    };
  },

  async removeWorkspaceItem({ syncData }) {

    console.log("remove item");
    console.log(syncData.id);
    const dbName = 'main'
    const res = await skyIdHelper.uploadNote({
      filename: syncData && syncData.id,
      workspace: dbName,
      type: syncData && syncData.type,
      id: syncData.itemId,
      remove: true,
    });

    return true;
  },

  async downloadWorkspaceContent({ token, contentSyncData, fileSyncData }) {
    console.log("at downloadcontent");
    const dbName = 'main';
    const body = await skyIdHelper.downloadNote({token, filename:contentSyncData.id, workspace:dbName, type: contentSyncData.type, id: contentSyncData.itemId});
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
    const dbName = 'main';
    const body = await skyIdHelper.downloadNote({token, filename: syncData.id, workspace:dbName, parent: '.stackedit-data', type: 'data', id: syncData.id});
    console.log("what found");
    console.log(body);
    const item = utils.addItemHash(body);
    console.log("what found 2");
    console.log(item);
    return {
      item,
      syncData: {
        ...syncData,
        hash: item.hash,
      },
    };
  },

  async uploadWorkspaceContent({ token, content, contentSyncData, file, fileSyncData}) {
    let dbName = 'main';
    console.log("upload content");

      await skyIdHelper.uploadNote({
        token,
        file: Provider.serializeContent(content),
        filename: JSON.stringify({
          id: content.id,
          type: content.type,
          hash: content.hash,
        }),
        id: content.id,
        type: content.type,
        workspace: dbName,
      });
    // Return new sync data
    return {
      contentSyncData: {
        id: JSON.stringify({
          id: content.id,
          type: content.type,
          hash: content.hash,
        }),
        itemId: content.id,
        type: content.type,
        hash: content.hash,
      },
    };
  },
  async uploadWorkspaceData({ token, item, syncData }) {

    console.log("upload data");
    console.log(item);
    let fname = syncData && syncData.id;
    const dbName = 'main';
    if(!syncData) fname = item.id;
    const res = await skyIdHelper.uploadNote({
      file: JSON.stringify(item),
      filename: fname,
      id: fname,
      parent: '.stackedit-data',
      workspace: dbName,
      type: 'data',
    });

    return {
      syncData: {
        id: fname,
        itemId: item.id,
        type: item.type,
        parent: item.parentId,
        hash: item.hash,
      },
    };
  },

});
