
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hello vajid');
});

Parse.Cloud.define('hi', function(req, res) {
  res.success('hi vajid');
});

Parse.Cloud.define("test", function(request, response) {

	// var GameScore = Parse.Object.extend("");
	var query = new Parse.Query(Parse.Installation);
	query.limit(10);
	query.find({useMasterKey: true,
	  success: function(results) {
	    // alert("Successfully retrieved " + results.length + " scores.");
	    response.success(results);
	  },
	  error: function(error) {
	    response.error(error);
	  }
	});

});

Parse.Cloud.define("testpush", function(request, response) {
	// Parse.Cloud.useMasterKey();
	var query = new Parse.Query(Parse.Installation);
	var message = "Message from AWS send by vajid";
	Parse.Push.send({
	  where: query,
	  data: {
		 alert: message
	  }
	}, { useMasterKey: true, success: function(result) {
		response.success(result);
	  }, error: function(err) {
		response.error(err);
	  }
	});
});

Parse.Cloud.define("sendPushNotification", function(request, response) {
	// Parse.Cloud.useMasterKey();
	var channel = request.params.channel;
	var message = request.params.message;
	Parse.Push.send({
	  channels: [channel],
	  data: {
		 alert: message
	  }
	}, { useMasterKey: true, success: function() {
		response.success("success");
	  }, error: function(err) {
		response.error(err);
	  }
	});
});

Parse.Cloud.define("sendPushNotificationWithInstallId", function(request, response) {
	// Parse.Cloud.useMasterKey();
	var installationId = request.params.installationId;
	var message = request.params.message;
	var query = new Parse.Query(Parse.Installation);
    query.equalTo('installationId', installationId);
	Parse.Push.send({
	  where: query,
	  data: {
		 alert: message
	  }
	}, { useMasterKey: true,
		success: function() {
		response.success("success");
	  }, error: function(err) {
		response.error(err);
	  }
	});
});

var cloud_code = {};

cloud_code.test = function (){

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

cloud_code.sendPushNotification = function(params,callback) {
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

cloud_code.sendPushNotificationWithInstallId =  function(params,callback) {
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

module.exports = cloud_code;

