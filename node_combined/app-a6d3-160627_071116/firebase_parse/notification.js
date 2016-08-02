/**
 * Created by abuhena on 3/9/16.
 */

/** Dependence Modules **/
var Firebase = require('firebase');
var staticData = require("../app.json");

/** Declear firebase references **/

var reference = new Firebase(staticData.firebaseUrl),
    devicesRef = reference.child('devices'),
    locationsRef = reference.child('locations'),
    notificationsRef = reference.child('notifications'),
    settingsRef = reference.child('settings');

/** define closures **/

var notifications,
    distance,
    message,
    newOne = false,
    radius,
    event,
    now;


exports.locationService = function(parse) {

    /** Run the main Firebase socket **/


    /** Will fire when any specific device has an update **/
    devicesRef.
        on("child_added", function(deviceSnapshot) {
            parseLoc(deviceSnapshot, parse);
        });

    /** Will fire when a new object add to device **/
    devicesRef.
        on("child_changed", function(deviceSnapshot) {
            console.log("**********Child are getting update*******");
            parseLoc(deviceSnapshot, parse);
        });
};



function parseLoc (deviceSnapshot, parse)
{
    var device = deviceSnapshot.val();
    var child_device = deviceSnapshot;


    locationsRef.
        orderByChild('eventId').
        equalTo(device.eventId).
        once("value", function(locationSnapshot) {

            locationSnapshot.
                forEach(function (child_location) {
                    var location = child_location.val();

                    //console.log("push: "+ location.event.is_available_push +
                    //    ", app: "+ location.event.is_available_on_app+
                    //    ", event: "+ device.eventId);

                    if (location.event.is_available_push&&location.event.is_available_on_app) {

                        if((!isNaN(location.latitude)|| !isNaN(location.longitude) ||
                            !isNaN(device.latitude) || !isNaN(device.longitude)) &&
                            typeof device.devicetoken != 'undefined')
                        {

                            event = location.event;
                            now = new Date().getTime();

                            settingsRef.child(device.devicetoken).once('value', function (setSnap) {
                                var settings = setSnap.val();


                                settings = settings == null ? {enableNotification: true} : settings;

                                if ((now > event.start || now < event.end)
                                    && settings.enableNotification) {

                                    distance = require('./connectfirebase').distance(location.latitude,
                                        location.longitude, device.latitude, device.longitude);
                                    radius = location.radius || 20;


                                    //console.log("distance: "+distance + " device: "+ device.devicetoken.substring(0, 8)
                                    //    +" radius: "+ radius);

                                    if (distance < radius) {

                                        console.log("In the distance");


                                        notificationsRef.orderByChild('deviceid').
                                            equalTo(child_device.key()).
                                            once('value', function (nSnapshot) {



                                                notifications = nSnapshot.val(); // Create the notification snapshot of that device
                                                message = getMessage(location.message, location.name, distance); // Create the msg


                                                console.log("@@@@@@@@@@@@@@@@@@@ ", child_location.key());

                                                if (nSnapshot.numChildren()>0) { //If notification obj found for this device

                                                    //Iterate through notifications
                                                    var i = 0; //initiate the index for iteration
                                                    var availableOn = new Array(); // Create an empty array for location store
                                                    nSnapshot.forEach(function (each) {
                                                        ++i; //increase index
                                                        var notification = each.val();
                                                        availableOn.push(notification.locationid); //push all available locationid
                                                        if (notification.locationid == child_location.key() &&
                                                            notification.deviceid==child_device.key()) {
                                                            //If the current location matches with the notification
                                                            //Checks time availability
                                                            if ((notification.pushdate + (24 * 3600 * 1000)) <
                                                                (new Date().getTime())) {
                                                                console.log ("Should get a new notification");

                                                                parse.sendNotificationWithInstallId(device.devicetoken,
                                                                    message, function (flag) {
                                                                        if (flag) {
                                                                            notificationsRef.push().set({
                                                                                deviceid: child_device.key(),
                                                                                locationid: child_location.key(),
                                                                                pushdate: new Date().getTime()
                                                                            });
                                                                        } else {
                                                                            console.log("parse error");
                                                                        }
                                                                    });

                                                            }
                                                        }

                                                        if (i==nSnapshot.numChildren()) { //if iteration ends, run this
                                                            if (availableOn.indexOf(child_location.key())==-1) {
                                                                //if location is not found on the array
                                                                //that means, this location is new point of interest
                                                                parse.sendNotificationWithInstallId(device.devicetoken,
                                                                    message, function (flag) {
                                                                        if (flag) {
                                                                            notificationsRef.push().set({
                                                                                deviceid: child_device.key(),
                                                                                locationid: child_location.key(),
                                                                                pushdate: new Date().getTime()
                                                                            });
                                                                        } else {
                                                                            console.log("parse error");
                                                                        }
                                                                    });

                                                            }
                                                        }
                                                    });
                                                } else {
                                                    // A very new notification will be sent
                                                    console.log("Ready ....");

                                                    parse.sendNotificationWithInstallId(device.devicetoken,
                                                        message, function (flag) {
                                                            if (flag) {
                                                                notificationsRef.push().set({
                                                                    deviceid: child_device.key(),
                                                                    locationid: child_location.key(),
                                                                    pushdate: new Date().getTime()
                                                                });
                                                            } else {
                                                                console.log("parse error");
                                                            }
                                                        });

                                                }


                                            });
                                    }


                                    //............

                                }

                            });


                        }
                    }
                });

        });
}


/** Helper functions **/

function getMessage(message, name, distance) {
    return message || 'You are approaching the ' + name + '. Distance is ' +Math.ceil(distance) + ' metre.';
}