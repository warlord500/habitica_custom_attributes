// below are the minumum adjustments for the script. 
//its recommmended to alter

var habId = "12345667-123456748-1234-123456789123"; //"HABITICA-ID-IN-QUOTES"
var habToken = "12345678-1234-1234-1234-1234567891234" //"HABITICA-TOKEN-IN-QUOTES"

//tags are indicators of task being part of the attribute! 
var attributes = ["cleaning","programming","health"]




//----------------------------------------------------------
//-----------------------------------------------
var paramsTemplatePut = {
  "method" : "put",
  "contentType": "application/json",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken
  },
}

var paramsTemplatePost = {
  "method" : "post",
  "contentType": "application/json",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken
  },
}
var paramsTemplateGet = {
  "method" : "get",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken,
  },
}  

function generateCustomHabits(){
  const urltaskCreator = "https://habitica.com/api/v3/tasks/user";
    attributes.forEach(function(attributeName){
      var params = paramsTemplatePost;
      params["payload"] = Utilities.newBlob(JSON.stringify({ 
        "text" : attributeName + " level: 0 xp: 0/" + xpCap(0),
        "type" : "habit",
        "up" : false,
        "down" : false,
    }));
    UrlFetchApp.fetch(urltaskCreator,params);
  });
}






function updateAllCustom() {
  //setup by getting all habits and dailies. 
  //one day will this up with webhook so that it updates after every completion instead of at all once! 
  const dailyParams = paramsTemplateGet;
  const dailyUrl = "https://habitica.com/api/v3/tasks/user?type=dailys";
  const dailyResponse = UrlFetchApp.fetch(dailyUrl, dailyParams);
  var dailys = JSON.parse(dailyResponse.getContentText()).data;

  const habitParams = paramsTemplateGet;
  const habitUrl = "https://habitica.com/api/v3/tasks/user?type=habits";
   const habitResponse = UrlFetchApp.fetch(habitUrl, habitParams);
  var habits = JSON.parse(habitResponse.getContentText()).data;

  const todoParams = paramsTemplateGet;
  const todoUrl = "https://habitica.com/api/v3/tasks/user?type=completedTodos";
  const todoResponse = UrlFetchApp.fetch(todoUrl, todoParams);
  var todos = JSON.parse(todoResponse.getContentText()).data;

  try{
   
    attributes.forEach(function(attributeName){
      var XpGained = 0;
      var id = getUserTags(attributeName);
     dailys.forEach(function(task){
        var containsTag = !(typeof(task.tags.find(function(tagName){ return tagName == id})) == 'undefined');
        if(containsTag && task.completed){
          //check if completed
          if (task.value > 21.27) {task.value = 21.27}
          if (task.value < -42.27) {task.value = -42.27}
          let taskDelta = Math.pow(0.9747,task.value)
          //Logger.log(task.text + " : " + taskDelta );
          XpGained += Math.ceil(task.priority * taskDelta * 10);
        } 
      });
      todos.forEach(function(task){
           const containsTag = !(typeof(task.tags.find(function(tagName){ return tagName == id})) == 'undefined'); 
           const completedDate =  new Date(task.updatedAt);
           const todayDate = new Date();
           if (
               completedDate.getYear() === todayDate.getYear() &&
               completedDate.getMonth() === todayDate.getMonth() && (
               completedDate.getDate() === todayDate.getDate() ||
               completedDate.getDate() === todayDate.getDate() -1) &
               containsTag
              ) {
                  let completedCheckList = 1;
                  task.checklist.forEach(function(item){if(item.completed){completedCheckList += 1;}})

                  if (task.value > 21.27) {task.value = 21.27}
                  if (task.value < -42.27) {task.value = -42.27}
                  let taskDelta = Math.pow(0.9747,task.value)
                  XpGained += Math.ceil(10*task.priority * taskDelta * completedCheckList);
                  Logger.log("complted item: " + task.text + " checklist count: " + completedCheckList);
              }   
        });

      Logger.log(attributeName + ": " + XpGained);
      updateHabit(attributeName,XpGained,habits);
      XpGained = 0;
    });

   } catch(e) {
     Logger.log(e.stack);
   }
}


function getUserTags(tagToLookFor){
  var response = (JSON.parse(UrlFetchApp.fetch("https://habitica.com/api/v3/tags", paramsTemplateGet))).data
  var id = response.find(function(tag){ return tag.name == tagToLookFor;}).id;

  return id;
}

function updateCleaningHabit() {
   const habitParams = paramsTemplateGet;
  const habitUrl = "https://habitica.com/api/v3/tasks/user?type=habits";
   const habitResponse = UrlFetchApp.fetch(habitUrl, habitParams);
  var habits = JSON.parse(habitResponse.getContentText()).data;
  updateHabit("cleaning",13,habits);
}

//todo optimize http calls and extract out habit list! 
function updateHabit(baseName,xpGained,habits){

   // search for attribute habit! 
   // the first one that contains the name.
   //TODO consider updating with better regex
   const attribute = habits.find(function(habit){
     return habit.text.search(baseName) != -1;
   });
   //Logger.log(attribute);
  const currentLevel = GetCurrentLevel(attribute.text);
  //Logger.log(currentLevel);
  const currentXp = GetCurrentXp(attribute.text)
  let newXp = xpGained + currentXp;  
  

  //todo fix this xp part!!
  //xp should never be above xpCap!!

  var newLevel = currentLevel;
  var gainedNewLevel = false;
  if (newXp > xpCap(currentLevel)) {
    newLevel +=1;
    gainedNewLevel = true
    newXp -= xpCap(currentLevel);
     
  }

  const updateUrl = "https://habitica.com/api/v3/tasks/" + attribute._id;
  const paramsUpdate = paramsTemplatePut;
  paramsUpdate["payload"] = Utilities.newBlob(JSON.stringify({
    "text" : baseName +  " level: " + newLevel + " xp: " + newXp + "/" + xpCap(newLevel), 
    "notes": "gained " + xpGained + " xp today" +  ((gainedNewLevel) ? " also gained a new level today" : "") }));
  

  const responseUpdate = UrlFetchApp.fetch(updateUrl,paramsUpdate);

}
//alter task text
  // compute if new level
  // add new xp to old xp 
  // 



function GetCurrentXp(attributeText){
  const startS = attributeText.indexOf("xp");
  const endS = attributeText.indexOf("/",startS);
  const intText = attributeText.slice(startS+3,startS+endS);
  return parseInt(intText);
}

function GetCurrentLevel(attributeText) {
   const startS = attributeText.indexOf("level:");
  const endS = attributeText.indexOf("xp:");
  const intText = attributeText.slice(startS+6,endS);
  Logger.log(intText);
  return parseInt(intText);

}


function xpCap(level){
  return Math.round((level*level*0.125+level*10+25)/5)*5;


}
