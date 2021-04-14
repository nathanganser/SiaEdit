/* eslint-disable */

import utils from '../../utils';
import networkSvc from '../../networkSvc';
import store from '../../../store';
import userSvc from '../../userSvc';
import badgeSvc from '../../badgeSvc';
import SkyID from '../../skyidapp/export/module';

var devMode = true
//
// if (window.location.hostname == 'idtest.local' || window.location.hostname == 'localhost' || window.location.protocol == 'file:') {
// 	var devMode = true
// } else {
// 	var devMode = false
// }

const opts = { devMode : devMode };
let done = false;
let skyid = new SkyID('StackEdit', async (message) => {
  done = true;
  switch (message) {
    case 'login_fail':
				console.log('Login failed')
				break;
			case 'login_success':
				console.log('Login succeed!')

        const profile = await skyid.getProfile();
        const user = JSON.parse(profile);
        console.log(user);

        const id = await skyid.getId();

        userSvc.addUserInfo({
          id: `${subPrefix}:${id}`,
          name: user.username,
          imageUrl: user.avatar || '',
        });

        // Build token object including scopes and sub
        const token = {
          name: user.username,
          sub: `${id}`,
          noteAccess: true,
        };

        console.log("?" + skyid.seed);

        store.dispatch('data/addSkyIdToken', token);
        badgeSvc.addBadge('addSkyIdAccount');

				break;
			case 'destroy':
				console.log('Logout succeed!')
				break;
			default:
				console.log(message)
				break;
  }
}, opts);

const subPrefix = 'si';

export default {

  subPrefix,

  async addAccount(noteAccess = true) {
    done = false;
    await skyid.sessionStart();

    // while (!done){
    //   setTimeout(function(){
    //   },1000);
    // }
    const id = await skyid.getId();
    return {sub: id};
    //await this.fetchNote();
  },

  async getId(){
    return await skyid.getId();
  },

  async removeAccount(){
    skyid.sessionDestroy();
    console.log("?" + skyid.seed)
    return;
  },

  async downloadNote({filename = null, skyId, workspace, parent = null, type, id}) {
    console.log("fetch test:" + workspace);
    let respObs = '';
		await skyid.getFile(workspace, function(response, revision) {
			if (response == '') { // file not found
        respObs = [];
			} else { // success
				respObs = JSON.parse(response).files
			}
      console.log("found")
      console.log(respObs);
		})
    //console.log("found")
    //console.log(respObs);
    if(!filename) return respObs
    return respObs.filter(file => file.filename == filename && file.type == type && file.parent == parent && file.id == id)[0];
    //return respObs.filter(file => file.id == id)[0];
	},

  async uploadNote({token, file = null, filename, skyId, workspace, type = null, id, parent = null, remove = null}) {
    console.log("at upload");
		//var note = document.getElementById('note').value
    var old = await this.downloadNote({workspace: workspace});
    //old = old.filter(it => !(it.filename == filename && it.type == type && it.parent == parent));
    old = old.filter(it => !(it.id == id));
    if(!remove) old.push({filename: filename, file: file, type: type, id: id, parent: parent});
    console.log("loc " + filename);
    console.log(old);
    //old = old.filter(file => file.filename != filename);
		var json = JSON.stringify({files: old});
		await skyid.setFile(workspace, json, function(response) {
      console.log("done " + filename);
			if (response != true) {
				alert('Sorry, but upload failed :(')
			}
		})
    return skyId;
	}
};
