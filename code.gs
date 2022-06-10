var habId = "123045676"; //"HABITICA-ID-IN-QUOTES"
var habToken = "123456778"; //"HABITICA-TOKEN-IN-QUOTES"
var webScript = 'https://example.com' //WebApp script after publishing.
var emailID = "jjbelezos@gmail.com";  //Your emailID

var tags = ["school"]

var paramsTemplatePost = {
  "method" : "post",
  "contentType": "application/json",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken
  },
  "encoding":false,
  "muteHttpExceptions": true,
}

var paramsTemplateGet = {
  "method" : "get",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken,
  },
}  

function loadCustom() {
  Logger.log("running load custom");
  var params = paramsTemplateGet;
  var url = "https://habitica.com/api/v3/tasks/user";
   var response = UrlFetchApp.fetch("https://habitica.com/api/v3/tasks/user?type=dailys", params);
  try{
    var dailys = JSON.parse(response.getContentText()).data;
    var cleanTasksXp = 0
    var id = getUserTags();
    dailys.forEach(function(task){
      var containsTag = !(typeof(task.tags.find(function(tagName){ return tagId == id })) == 'undefined');
      if(containsTag){
        Logger.log(task.text);
        cleanTasksXp += 1;
      } 
    });
    Logger.log("number of clean tasks " + cleanTasksXp)
  
   } catch(e) {
     Logger.log(e.stack);
   }
}


function getUserTags(){
  Logger.log("get User tags");
  var response = (JSON.parse(UrlFetchApp.fetch("https://habitica.com/api/v3/tags", paramsTemplateGet))).data
 var id = Logger.log(response.find(function(tag){Logger.log(tag.name); return tag.name == "cleaning";}));
}
