/*******************************************************************************
 * 
 * @version :   1.0.0
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @description : Receive request and launch Firebase and Parse Model
 * @update  :
 * 
 ********************************************************************************/

module.exports = function(app, myfirebase, myparse){

  /*ignore this..this is used for testing*/
  app.post('/ignore_testpath', function (req, res) {
    console.log("data is below");
    console.log(req.body);
    var sendedData = req.body;
    var channel = sendedData.channel;
    var message = sendedData.message;
    myparse.mytest(channel, message);
    return res.send('success');
  });

 /*******************************************************************************
 *        Update location request
 * @param {string} udid(required)       :  mobile device UDID 
 * @param {string} devicetoken(optional):  Parse installationID
 * @param {string} eventId(optional)    :  Firebase Eventid
 * @param {double} latitude(required)   :  latitude of mobile device
 * @param {double} longitude(required)  :  longitude of mobile device
 * 
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @description : Receive location update request from ionic app and update Firebase
 * @update  :
 * 
 ********************************************************************************/
  app.post('/update', function (req, res) {
    console.log("it reached the update code");
    var sendedData = req.body;
    console.log(sendedData);
    if(!sendedData.deviceid){
      res.send('deviceid undefined.');
    } else {
      myfirebase.updateLocation(sendedData, res);
      //res.send('success');
    }

  });
 /*******************************************************************************
 * 
 *       Send Push Notification with Eventid
 *       
 * @param {string} channel(required)       :  Eventid
 * @param {string} devicetoken(required)   :  Push Message
 * 
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @update  :
 * 
 ********************************************************************************/
  app.post('/sendpnWithChannel', function (req, res) {
    console.log("data is below");
    console.log(req.body);
    var sendedData = req.body;
    var channel = sendedData.channel;
    var message = sendedData.message;
    myparse.sendNotificationWithChannel(channel, message, function(result){
        if(result){
          return res.send('success');
        }else{
          return res.send('failure');
        }
    });
    // return res.send('success');
  });
 /*******************************************************************************
 *
 * Send Push Notification with deviceid
 *
 * @param {string} deviceid(required)      :  Parse devicetoken
 * @param {string} devicetoken(required)   :  Push Message
 *
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @update  :
 *
 ********************************************************************************/
  app.post('/sendNotificationWithDeviceId', function (req, res) {
    var sendedData = req.body;
    var installId = sendedData.deviceid;
    var message = sendedData.message;
    myparse.sendNotificationWithInstallId(installId, message,function(result){
        if(result){
          return res.send('success');
        }else{
          return res.send('failure');
        }
    });
    // return res.send('success');
  });

};