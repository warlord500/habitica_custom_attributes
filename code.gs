// below are the minumum adjustments for the script. 
//its recommmended to alter
// these can be found  under setting api or https://habitica.com/user/settings/api
var habId = "12345667-123456748-1234-123456789123"; //"HABITICA-ID-IN-QUOTES"
var habToken = "12345678-1234-1234-1234-1234567891234" //"HABITICA-TOKEN-IN-QUOTES"

//tags are indicators of task being part of the attribute! 
var attributes = ["cleaning","programming","health"]


//----------------------------------------------------------
//optional adjustments
// enabled by default. 
// if hit negative side on habit you will lose custom attribute xp. 
// or if you fail to complete a daily before this runs 
// replace 1 with 0 if you want to disable negative xp or 
// replace with higher number for even worse penalties!
const NEGATIVE_XP = 2;

//-----------------------------------------------
// DONT TOUCH UNDERNEATH HERE

const XCLIENT = "497d1667-d0e0-4748-9dcf-612d74a282ea-5hammer"
var paramsTemplatePut = {
  "method" : "put",
  "contentType": "application/json",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken,
    "x-client" : XCLIENT
  },
}

var paramsTemplatePost = {
  "method" : "post",
  "contentType": "application/json",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken,
    "x-client" : XCLIENT
  },
}
var paramsTemplateGet = {
  "method" : "get",
  "headers" : {
    "x-api-user" : habId, 
    "x-api-key" : habToken,
    "x-client" : XCLIENT
  },
}  

function generateCustomHabits(){
  
  const urltaskCreator = "https://habitica.com/api/v3/tasks/user";
    attributes.forEach(function(attributeName){
      var params = paramsTemplatePost;
      var tagID = getUserTags(attributeName);
      params["payload"] = Utilities.newBlob(JSON.stringify({ 
        "text" : attributeName + " level: 0 xp: 0/" + xpCap(0),
        "type" : "habit",
        "up" : true,
        "down" : true,
        "tags" : [tagID,],
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
  Utilities.sleep(2*1000)

  const habitParams = paramsTemplateGet;
  const habitUrl = "https://habitica.com/api/v3/tasks/user?type=habits";
   const habitResponse = UrlFetchApp.fetch(habitUrl, habitParams);
  var habits = JSON.parse(habitResponse.getContentText()).data;
  Utilities.sleep(2*1000);

  const todoParams = paramsTemplateGet;
  const todoUrl = "https://habitica.com/api/v3/tasks/user?type=completedTodos";
  const todoResponse = UrlFetchApp.fetch(todoUrl, todoParams);
  var todos = JSON.parse(todoResponse.getContentText()).data;
  Utilities.sleep(2*1000);

  try{
   
    attributes.forEach(function(attributeName){
      var XpGained = 0;
      var habitPosXp = 0;
      var habitNegXp = 0;
      var id = getUserTags(attributeName);
     dailys.forEach(function(task){
        const containsTag = !(typeof(task.tags.find(function(tagName){ return tagName == id})) == 'undefined');
        if(containsTag){
          var penaltyOrNot;
          if(task.completed){
            //if postive then good neg =bad
            penaltyOrNot =1;

          } else if(task.isDue && !task.completed) {
              penaltyOrNot = -NEGATIVE_XP;
          } else {
            //task is not completed so doesnt count towards xpGained.
            penaltyOrNot = 0;
          }
          XpGained += Math.ceil(task.priority * sanitizeTaskValue(task.value) * 10*penaltyOrNot);
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
                completedDate.getDate() === todayDate.getDate() -1) &&
                containsTag
              ) {
                  let completedCheckList = 1;
                  task.checklist.forEach(function(item){if(item.completed){completedCheckList += 1;}})

               
                  XpGained += Math.ceil(10*task.priority * sanitizeTaskValue(task.value) * completedCheckList);
              }   
        });
        habits.forEach(function(habitTask){
               const containsTag = !(typeof(habitTask.tags.find(function(tagName){ return tagName == id})) == 'undefined');
               if(containsTag){ 
                 Logger.log(habitTask.text +" : " + habitTask.frequency)
                 var countThisHabitNow = (habitTask.frequency=="daily");
                 countThisHabitNow |= (habitTask.frequency == "weekly") &&   (new Date()).getDay() == 0;
                 countThisHabitNow |= (habitTask.frequency == "monthly") && (new Date()).getDate == 1;

                 if(countThisHabitNow){

                    habitPosXp += Math.ceil(habitTask.counterUp * sanitizeTaskValue(habitTask.value) * 10 * habitTask.priority);
                    habitNegXp += Math.ceil(habitTask.counterDown * sanitizeTaskValue(habitTask.value) * 10 * habitTask.priority* NEGATIVE_XP);
                    
                 }
               }
        });
        XpGained += habitPosXp;
        XpGained -= habitNegXp;
      updateHabit(attributeName,XpGained,habits,habitPosXp,habitNegXp);
      XpGained = 0;
      Utilities.sleep(30*1000);
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
function updateHabit(baseName,xpGained,habits,habitPosXp,habitNegXp){

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
  if(currentXp < 0){
    newLevel -= 1;
    newXp = 0;
  } else {
    if (newXp > xpCap(currentLevel)) {
      newLevel +=1;
      gainedNewLevel = true
      newXp -= xpCap(currentLevel); 
    }
  }

  const habitText = "habit positive  xp: " + habitPosXp + " habit negative xp: " + habitNegXp;
  const levelText =  ((gainedNewLevel) ? "\n ### **gained a new level today!!** " : "");
  const noteSeperator = "";

  const updateUrl = "https://habitica.com/api/v3/tasks/" + attribute._id;
  const paramsUpdate = paramsTemplatePut;
  paramsUpdate["payload"] = Utilities.newBlob(JSON.stringify({
    "text" : baseName +  " level: " + newLevel + " xp: " + newXp + "/" + xpCap(newLevel), 
    "notes": "gained " + xpGained + " xp today" + habitText + " " + levelText }));
  

  const responseUpdate = UrlFetchApp.fetch(updateUrl,paramsUpdate);

}


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


function sanitizeTaskValue(value){
     if (value > 21.27) {value = 21.27}
     if (value < -42.27) {value = -42.27}
     return Math.pow(0.9747,value);
}

function xpCap(level){
  return Math.round((level*level*0.125+level*10+25)/5)*5;


}
