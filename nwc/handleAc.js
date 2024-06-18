var utils = require('./utils');

module.exports = function(socket, request) {
  var status;
  var body;

  if (Object.keys(request.body).length === 0) {
    status = '400 Bad Request';
    body = "Request body is missing";
    utils.sendHttpResponse(socket, status, body);
    return;
  }

  try {
    var post = utils.queryStringToMap(request.body);

    post["ipaddr"] = socket.remoteAddress;
    var action = post["action"].toLowerCase();

    var ret;
    switch (action) {
      case "login":
        var challenge = utils.generateRandomStr(8);
        var authtoken = utils.generateAuthToken(request.body.userid, request.body);
        ret = {
          retry: "0",
          returncd: "001",
          locator: "gamespy.com",
          challenge: challenge,
          token: authtoken
        };
        break;
      case "svcloc":
        var authtokenSvc = utils.generateAuthToken(request.body.userid, request.body);
        ret = {
          retry: "0",
          returncd: "007",
          statusdata: "Y"
        };
        if ("svc" in request.body) {
          if (request.body.svc === "9000" || request.body.svc === "9001") {
            ret["svchost"] = request.headers.host.split(",")[0];
            if (request.body.svc === "9000") {
              ret["token"] = authtokenSvc;
            } else {
              ret["servicetoken"] = authtokenSvc;
            }
          } else if (request.body.svc === "0000") {
            ret["servicetoken"] = authtokenSvc;
            ret["svchost"] = "n/a";
          } else {
            ret["svchost"] = "n/a";
            ret["servicetoken"] = authtokenSvc;
          }
        }
        break;
      default:
        status = '400 Bad Request';
        body = "Invalid action";
    }

    if (ret) {
      ret["datetime"] = new Date()
        .toISOString()
        .replace(/T/, "")
        .replace(/\..+/, "");
      body = utils.mapToQueryString(ret);
      status = '200 OK';
    }
  } catch (error) {
    console.error("Exception occurred on POST request!", error);
  }
  utils.sendHttpResponse(socket, status, body);
};
