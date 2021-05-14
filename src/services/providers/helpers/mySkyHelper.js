/* eslint-disable */

import utils from '../../utils';
import networkSvc from '../../networkSvc';
import store from '../../../store';
import userSvc from '../../userSvc';
import badgeSvc from '../../badgeSvc';
import { SkynetClient } from 'skynet-js';
import { ContentRecordDAC } from "@skynetlabs/content-record-library";
import syncSvc from '../../syncSvc';

let done = false;

// uncomment for dev
// const hostApp = "https://siasky.dev";
// const client = new SkynetClient(hostApp);

// uncomment for prod
const hostApp = "siaedit.hns";
const client = new SkynetClient();

const contentRecord = new ContentRecordDAC();
const path = hostApp + "/siaedit/main.json";

let mySky = null;

const subPrefix = 'ms';

export default {

  subPrefix,

  async addAccount(noteAccess = true, main = false) {
    try {
      mySky = await client.loadMySky(hostApp);
      await mySky.loadDacs(contentRecord);

      const loggedIn = await mySky.checkLogin();
      let status = null;
      if (!loggedIn) {
        status = await mySky.requestLoginAccess();
      }
      if(loggedIn || status){
        const id = await mySky.userID();
        userSvc.addUserInfo({
          id: `${subPrefix}:${id}`,
          name: 'MySky',
          imageUrl: 'test',
        });

        const token = {
          isLogin: !store.getters['workspace/mainWorkspaceToken'],
          name: 'MySky',
          sub: id,
          provider: "mySkyWorkspace",
          noteAccess: true,
        };

        store.dispatch('data/addMySkyToken', token);
        await syncSvc.init();
        // badgeSvc.addBadge('addSkyIdAccount');
        location.reload();
    }

    } catch (error) {
      console.log(error)
    }
    return true;
  },

  async load() {
    try {
      mySky = await client.loadMySky(hostApp);
      await mySky.loadDacs(contentRecord);
    } catch (error) {
      console.log(error)
    }
  },

  async getId(){
  },

  async removeAccount(){
    try {
      await mySky.logout();
    } catch (error) {
      console.log(error)
    }
    return;
  },

async downloadNote({filename = null, workspace, parent = null, type, id}) {
  let respObs = '';
  await this.getJSON(workspace, function(response, revision) {
    if (response == '' || response == null) {
      respObs = [];
    } else {
      respObs = JSON.parse(response).files
    }
  })
  if(!filename) return respObs
  return respObs.filter(file => file.filename == filename && file.type == type && file.parent == parent && file.id == id)[0];
},

  async uploadNote({token, file = null, filename, workspace, type = null, id, parent = null, remove = null}) {
    var old = await this.downloadNote({workspace: workspace});
    old = old.filter(it => !(it.id == id));
    if(!remove) old.push({filename: filename, file: file, type: type, id: id, parent: parent});
		var json = JSON.stringify({files: old});
		await this.setJSON(workspace, json, function(response) {
			if (response != true) {
				alert('Sorry, but upload failed :(')
			}
		})
	},

  async getJSON(dataKey, callback) {
		try {
			var { data, skylink } = await mySky.getJSON(path)
		} catch (error) {
			var data = ''
		}
		if(data != null && data != '') data = JSON.stringify(data);
		callback(data, 0)
	},

	async setJSON(dataKey, json, callback) {
		if(typeof json != 'object') json = JSON.parse(json);
		try {
			await mySky.setJSON(path, json)
			var success = true
		} catch (error) {
			console.log(error)
			alert('Failed to save file, please retry.')
			var success = false
		}
		callback(success)
	},

  async publishDAC(url){
    let skylink = url.split('/');
    skylink = skylink[skylink.length - 1];
    try {
      await contentRecord.recordNewContent({
        skylink: skylink,
        metadata: {
          content: { link: url }
        }
      });
      var success = true
		} catch (error) {
			console.log(error)
			alert('Failed to publish file, please retry.')
			var success = false
		}
  }

};
