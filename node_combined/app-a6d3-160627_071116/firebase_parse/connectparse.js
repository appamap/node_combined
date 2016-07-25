/*******************************************************************************
 *
 * @version :   1.0.0
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @description : Parse Push Notification Model
 * @update  :
 *
 ********************************************************************************/

/*var Parse = require('parse/node').Parse;
var AppConstants = require("../../app.json");
var APP_ID = AppConstants.PARSE_APP_ID;
var MASTER_KEY = AppConstants.PARSE_MASTER_KEY;
var JS_KEY = AppConstants.PARSE_JS_KEY;
Parse.initialize(APP_ID, JS_KEY, MASTER_KEY);*/

var cc = require('../cloud/push_functions.js');

exports.mytest = function (installId, message, cb) {
  console.log("reached inside connectparse");
  var requestJSON = {
        installationId: installId,
        message: message
      };
      console.log(requestJSON);

      console.log("reached before calling cc test vajid");
      cc.testVajid();

      /*// Call Parse Cloud function sendPushNotificationWithInstallId
      Parse.Cloud.run('sendPushNotificationWithInstallId', requestJSON).then(
        function(result) {
          console.log("###############Reached in cloud code run result success");
          cb(true);
        },
        function(error) {
          console.log("###############Reached in cloud code run result error");
          cb(false);
        }
      );*/
  return;
};

/*******************************************************************************
 *
 *   Send Push Notification with installationId of Parse installation object
 *
 * @param {string} installId(required)     :  installId
 * @param {string} devicetoken(required)   :  Push Message
 *
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @update  :
 *
 ********************************************************************************/
exports.sendNotificationWithInstallId = function (installId, message, cb) {
  console.log("reached inside connectparse")
  var requestJSON = {
                        installationId: installId,
                        message: message
                    };
  console.log(requestJSON);
  cc.sendPushNotificationWithInstallId(requestJSON,function(error,success){
      if(error){
        console.log("called CB False")
        return cb(false);
      }else{
        console.log("called CB True")
        return cb(true);
      }
  })
  // return;
};
/*******************************************************************************
 *
 *   Send Push Notification with channel of Parse installation object
 *
 * @param {string} channel(required)       :  channel
 * @param {string} devicetoken(required)   :  Push Message
 *
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @update  :
 *
 ********************************************************************************/
exports.sendNotificationWithChannel = function (channel, message, cb) {
  console.log("reached inside send notification");
  var requestJSON = {
                      channel: channel,
                      message: message
                    };
  console.log(requestJSON);
  cc.sendPushNotification(requestJSON,function(error,success){
      if(error){
        console.log("called CB False")
        return cb(false);
      }else{
        console.log("called CB True")
        return cb(true);
      }
  });
  // return;
};