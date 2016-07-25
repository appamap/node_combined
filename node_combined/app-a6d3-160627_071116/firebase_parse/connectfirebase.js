/*******************************************************************************
 * 
 * @version :   1.0.0
 * @author  :   Anatoly Sokolov
 * @date    :   2015-12-05
 * @description : Firebase Model
 * @update  :
 * 
 ********************************************************************************/

var Firebase = require('firebase');
var AppConstants = require("../app.json");
var firebaseUrl = AppConstants.firebaseUrl;

 /*******************************************************************************
 *        Update location function
 * @param {string} deviceid(required)   :  Parse installationID
 * @param {string} subscribe(optional)  :  Firebase Eventid
 * @param {double} lat(required)        :  latitude of mobile device
 * @param {double} lng(required)        :  longitude of mobile device
 * 
 * @author      :   Anatoly Sokolov
 * @date        :   2015-12-05
 * @description :   Update the devices object on Firebase.
 * @update      :
 * 
 ********************************************************************************/
exports.updateLocation = function (req, res) {
  console.log("reached in connectfirebase update location");
  var deviceid = req.deviceid || '';
  var subscribes = req.subscribe || new Array();
  var lat = req.lat || null;
  var lng = req.lng || null;
  var deviceArr;
  //console.log("your request ***************** ", req);
  var updateData = {
    latitude: lat,
    longitude: lng
  };

  if (typeof deviceid!='undefined'||deviceid.length<1) {

    const reference = new Firebase(firebaseUrl);
    var deviceRef = reference.child('devices');
    var settingsRef = reference.child('settings').child(deviceid);

    var devices = deviceRef.orderByChild('devicetoken').equalTo(deviceid);

    settingsRef.once("value", function(setttingSnap) {

      var setting = setttingSnap.val();

      if (!setting || setting.enableShareGps !== false) {

        //devices.once("value", function (snap) {
        //  console.log("*************************\n" + JSON.stringify(snap.val()) + "\n**************************");
        //});
        devices.once('value', function (deviceSnap) {
          var device = deviceSnap.val();

          //console.log(device);

          if (device===null) {

            subscribes.forEach(function (subscribe) {

              deviceRef.push().set({
                devicetoken: deviceid,
                eventId: subscribe.replace("channel", "")
              });

            });

            res.send({
              success: true,
              message: 'Device added!'
            });

            //console.log("new device added");

          } else {

            deviceSnap.forEach(function (eachDevice) {
              var value = eachDevice.val();
              var index = subscribes.indexOf("channel"+ value.eventId);
              if (index>-1) {

                subscribes.splice(index, 1);

                //console.log("\n\n#############\n\n"+ value.eventId +"\n\n#############\n\n");

                var newDeviceRef = new Firebase(firebaseUrl + "/devices/" + eachDevice.key());

                if (lat!==null||lng!==null) {
                  newDeviceRef.update(updateData, function (err) {

                    if (err) {
                      //console.log(err);
                    } else {
                      //console.log("unerror");
                    }

                  });
                }

              }

            });

            //console.log("\n**********\n"+ subscribes +"\n**************\n");

            if (subscribes.length>0) {
              subscribes.forEach(function (subscribe) {

                deviceRef.push().set({
                  devicetoken: deviceid,
                  eventId: subscribe.replace("channel", "")
                });

              });
            } else {

              deviceSnap.forEach(function (eachDevice) {

                var newDeviceRef = new Firebase(firebaseUrl + "/devices/" + eachDevice.key());
                if (lat!==null||lng!==null) {
                  newDeviceRef.update(updateData, function (err) {

                    if (err) {
                      //console.log(err);
                    } else {
                      //console.log("unerror");
                    }

                  });
                }

              });

              res.send({
                success: true,
                message: 'request accepted'
              });

            }


            /*subscribes.forEach(function (subscribe) {

              var eventID = subscribe.replace("channel", "");

              deviceSnap.forEach(function (eachDevice) {

                if (eachDevice.eventId==eventID) {

                  var newDeviceRef = new Firebase(firebaseUrl + "/devices/" + eachDevice.key());

                  newDeviceRef.update(updateData, function (err) {

                    if (err) {
                      console.log(err);
                    } else {
                      console.log("unerror");
                    }

                  });

                } else {

                  deviceRef.push().set({
                    devicetoken: deviceid,
                    eventId: eventID,
                    latitude: (lat || 0.0),
                    longitude: (lng || 0.0)
                  });

                }

              });


            });*/
          }
        });

      } else {
        console.log("Settings found, "+ setting);
      }

    });

  } else {
    res.
        status(500).
        send({
      success: false,
      message: 'Invalid Device ID'
    });
  }

  /****************************************************/

  /*if(deviceid.length){
    var isFirebaseChange = false;
    var firebaseDevices = [];
    var reference = new Firebase(firebaseUrl);
    var devicesRef = reference.child('devices');

    deviceArr = devicesRef.orderByChild('devicetoken').equalTo(deviceid);

    var settingsRef = reference.child('settings').child(deviceid);
    var isNotificationUpdate = false;
    settingsRef.on("value", function(settingValue){
        var setting = settingValue.val();     
        console.log("your request onSetting", setting);
        if(!setting || setting.enableShareGps !== false) {
           deviceArr.on('value', function (snapshot) {
              if (isFirebaseChange)
                return;
              isFirebaseChange = true;
              firebaseDevices = snapshot.val();
              console.log("your request onDevice", firebaseDevices);
              if (firebaseDevices == null) {
                for (var i = 0; i < subscribe.length; i++) {
                  var eventId = subscribe[i].replace("channel", "");
                  devicesRef.push().set({
                    devicetoken: deviceid,
                    eventId: eventId
                  });
                }
              } else {
                if(subscribe){
                  for (var i = 0; i < subscribe.length; i++) {
                    var eventId = subscribe[i].replace("channel", "");

                    var isUpdate = false;
                    for (var key in firebaseDevices) {
                      var obj = firebaseDevices[key];
                      if (obj.eventId == eventId) {
                        updateData.eventId = eventId;
                        var newDeviceRef = new Firebase(firebaseUrl + '/devices/' + key);
                        newDeviceRef.update(updateData, function (err) {
                          if (err)
                            console.log('err', err);
                          else
                            console.log('suceesss');
                          isNotificationUpdate = false;
                        });
                        isUpdate = true;
                      }
                    }
                    if (!isUpdate) {
                      updateData.eventId = eventId;
                      devicesRef.push().set({
                        devicetoken: deviceid,
                        eventId: eventId
                      });
                      isNotificationUpdate = false;
                    }
                  }
                }else{
                  // This part will be launched from Background GPS plugin...
                  var isUpdate = false;
                  for (var key in firebaseDevices) {
                    var newDeviceRef = new Firebase(firebaseUrl + '/devices/' + key);
                    newDeviceRef.update(updateData, function (err) {
                      if (err){
                        console.log('err', err);
                      }else{
                        isNotificationUpdate = false;
                      }
                    });
                  }
                }
              }
            }, function (errorObject) {
              console.log("The read failed: " + errorObject.code);
            });
          }
        //}
        
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
    })
  }
  return;*/
};
/*******************************************************************************
 *        Match location function
 * 
 * @author      :   Anatoly Sokolov
 * @date        :   2015-12-05
 * @description :   Device locations will be matched with event locations and when matched that, send Push Notification.
 * @update      :
 * 
 ********************************************************************************/
/*exports.matchLocation = function (myparse) {
  var reference = new Firebase(firebaseUrl);
  var devicesRef = reference.child('devices'); // devices object of Firebase
  var locationsRef = reference.child('locations'); // locations object of Firebase
  var notificationsRef = reference.child('notifications'); // notifications object of Firebase
  var isUpdate = false; // A flag to prevent saving data when CMS update.
  
  devicesRef.orderByKey().on("value", function(devicesnapshot) {
    var devices = devicesnapshot.val();
    locationsRef.orderByKey().on("value", function(locationssnapshot) {
      if(isUpdate) return;
      isUpdate = true;
      var locations = locationssnapshot.val();
      for (var key1 in locations) {
        var location = locations[key1];
        var pnSending = true;
        for (var key2 in devices) {
          var device = devices[key2];
          // Calculate distance between two locations.
          if(isNaN(location.latitude)|| isNaN(location.longitude) || isNaN(device.latitude) || isNaN(device.longitude)){
            continue;
          }
          var dist = distance(location.latitude,location.longitude, device.latitude,device.longitude);          
          // Get location event matched radius, if null, set 20 metre as default.
          var radius = location.radius || 20;
          
          if(dist < radius*1){
            // Check previous location that is already sent Push notification.
            var lc_event = location.event;
            var start = lc_event.start;
            var ispush = lc_event.is_available_push;
            var end = lc_event.end;
            var current_time = new Date().getTime();
            pnSending = false;
            if(current_time < start || current_time > end){
              console.log("This event is expired.");
            } else {
              if(ispush){
                var isNotificationUpdate = false;
                var notificationArr = notificationsRef.orderByChild('deviceid').equalTo(key2);
                notificationArr.on('value', function (snapshot) {
                  if(!isNotificationUpdate){
                    isNotificationUpdate = true;
                    notifications = snapshot.val();
                    if(notifications == null){
                      var settingsRef = reference.child('settings').child(device.devicetoken);
                      settingsRef.on("value", function(settingValue){
                        var setting = settingValue.val();
                        if(!setting || setting.enableNotification !== false ){
                          
                          var message = location.message || 'You are approaching the ' + location.name + '. Distance is ' +Math.ceil(dist) + ' metre.'
                          // Send Push Notification with the installationID of Parse Installation object.
                          if (dist < radius * 1)
                            myparse.sendNotificationWithInstallId(device.devicetoken, message, function(flag){
                              if(flag)
                                notificationsRef.push().set({
                                  deviceid: key2,
                                  locationid: key1,
                                  pushdate: current_time
                                });
                            });
                        }                        
                      }, function (errorObject) {
                            console.log("The read failed: " + errorObject.code);
                      })                      
                    } else {
                      var pushIsUpdated = false;
                      for (var notikey in notifications) {
                        var notification = notifications[notikey];
                        if(notification.locationid == key1 && notification.deviceid == key2) {
                          pushIsUpdated = true;
                          var afterDay = notification.pushdate*1 + 60 * 30 * 1000;

                          if(afterDay*1 < current_time*1) {
                            var settingsRef = reference.child('settings').child(device.devicetoken);
                            settingsRef.on("value", function(settingValue){
                              var setting = settingValue.val();
                              if(!setting || setting.enableNotification !== false ){
                                var message = location.message || 'You are approching the ' + location.name + '. Distance is ' +Math.ceil(dist) + ' metre.'
                                // Send Push Notification with the installationID of Parse Installation object.
                                if (dist < radius * 1)
                                  myparse.sendNotificationWithInstallId(device.devicetoken, message, function(flag){
                                    console.log(flag);
                                    if(flag){
                                      var updateNotificationRef = new Firebase(firebaseUrl + '/notifications/' + notikey);
                                      updateNotificationRef.update({pushdate: new Date().getTime()}, function (err) {});
                                    }
                                  });
                              }                        
                            }, function (errorObject) {
                              console.log("The read failed: " + errorObject.code);
                            })                            
                          }
                        }
                      }
                      if(!pushIsUpdated){
                        
                        // Send Push Notification with the installationID of Parse Installation object.
                        var settingsRef = reference.child('settings').child(device.devicetoken);  
                        settingsRef.on("value", function(settingValue){
                            var setting = settingValue.val();
                            if(!setting || setting.enableNotification !== false ){                              
                              var message = location.message || 'You are approching the ' + location.name + '. Distance is ' +Math.ceil(dist) + ' metre.'
                              if (dist < radius * 1)
                                myparse.sendNotificationWithInstallId(device.devicetoken, message, function(flag){
                                  console.log(flag);
                                  if(flag)
                                    notificationsRef.push().set({
                                      deviceid: key2,
                                      locationid: key1,
                                      pushdate: current_time
                                    });
                                });
                            }                        
                          }, function (errorObject) {
                                console.log("The read failed: " + errorObject.code);
                        })
                      }
                    }
                  }
                  
                }, function (errorObject) {
                  console.log("The read failed: " + errorObject.code);
                });
              }else{
                console.log("Push notification is disabled.");
              }
            }
          }
        }
      }
    });
  });
}*/

if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}
// Calculate the distance between two locations
exports.distance = function(lon1, lat1, lon2, lat2){
  var R = 6371; // Radius of the earth in km
  var dLat = (lat2-lat1) * Math.PI / 180;  // Javascript functions in radians
  var dLon = (lon2-lon1) * Math.PI / 180; 
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
          Math.sin(dLon/2) * Math.sin(dLon/2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c * 1000; // Distance in km
  return d;
}

