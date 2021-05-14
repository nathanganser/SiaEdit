/* eslint-disable */

import store from '../../store';
import skyIdHelper from './helpers/skyIdHelper';
import Provider from './common/Provider';
import workspaceSvc from '../workspaceSvc';

export default new Provider({
  id: 'skyId',
  name: 'SkyID',
  getToken({ sub }) {
    return store.getters['data/skyIdTokensBySub'][sub];
  },
  getLocationDescription({ filename }) {
    return filename;
  },
  getLocationUrl({ gistId }) {
    return gistId;
  },
  async uploadContent(token, content, syncLocation) {
    const sky = await skyIdHelper.uploadNote({
      ...syncLocation,
      id: syncLocation.filename,
      type: 'file',
      workspace: Object.keys(store.getters['data/skyIdTokensBySub'])[0],
      file: Provider.serializeContent(content),
    });
    return {
      ...syncLocation,
      skyId: sky,
    };
  },
  async downloadContent(token, syncLocation) {
    const data = await skyIdHelper.downloadNote({
      ...syncLocation,
      id: syncLocation.filename,
      type: 'file',
      workspace: Object.keys(store.getters['data/skyIdTokensBySub'])[0],
      token,
    });
    return Provider.parseContent(data.file, `${syncLocation.fileId}/content`);
  },
  async openFile(token, syncLocation) {
    // Check if the file exists and open it

    let content;
    try {
      content = await this.downloadContent(token, syncLocation);
    } catch (e) {
      store.dispatch('notification/error', `Could not open note ${syncLocation.filename}.`);
      return;
    }

    // Create the file
    let name = syncLocation.filename;
    const slashPos = name.lastIndexOf('/');
    if (slashPos > -1 && slashPos < name.length - 1) {
      name = name.slice(slashPos + 1);
    }
    const dotPos = name.lastIndexOf('.');
    if (dotPos > 0 && slashPos < name.length) {
      name = name.slice(0, dotPos);
    }
    const item = await workspaceSvc.createFile({
      name,
      parentId: store.getters['file/current'].parentId,
      text: content.text,
      properties: content.properties,
      discussions: content.discussions,
      comments: content.comments,
    }, true);
    store.commit('file/setCurrentId', item.id);
    workspaceSvc.addSyncLocation({
      ...syncLocation,
      fileId: item.id,
    });
    store.dispatch('notification/info', `${store.getters['file/current'].name} was imported from SkyDB.`);
  },

  makeLocation(token, filename) {
    return {
      providerId: this.id,
      sub: token.sub,
      filename,
    };
  },
});
