
var push_functions = {};

push_functions.test = function (){

	console.log("reached inside vajid");
	var query = new Parse.Query(Parse.Installation);
	query.limit(1);
	query.find({useMasterKey: true,
	  success: function(results) {
	    // alert("Successfully retrieved " + results.length + " scores.");
	    console.log("success");
	    console.log(JSON.stringifty(results[0]));
	  },
	  error: function(error) {
	  	console.log("error");
	    console.log(error);
	  }
	});
}

push_functions.sendPushNotification = function(params,callback) {
	// Parse.Cloud.useMasterKey();
	var channel = params.channel;
	var message = params.message;
	Parse.Push.send({
	  channels: [channel],
	  data: {
		 alert: message
	  }
	}, { useMasterKey: true,
		success: function(result) {
			console.log("success in sendPushNotification cloud code method");
			return callback(null,"Push success");
	    },error: function(error) {
			console.log("error in sendPushNotification cloud code method");
			console.log(error);
			return callback("Push failed",null);
	    }
	});
};

push_functions.sendPushNotificationWithInstallId =  function(params,callback) {
	// Parse.Cloud.useMasterKey();
	var installationId = params.installationId;
	var message = params.message;
	var query = new Parse.Query(Parse.Installation);
    query.equalTo('installationId', installationId);
	Parse.Push.send({
	  where: query,
	  data: {
		 alert: message
	  }
	}, { useMasterKey: true,
		success: function(result) {
		 console.log("success in sendPushNotificationWithInstallId cloud code method");
		 return callback(null,"Push Succeeded");
	  }, error: function(error) {
		 console.log("error in sendPushNotificationWithInstallId cloud code method");
		 console.log(error);
		 return callback("Push failed",null);
	  }
	});
};

module.exports = push_functions;

