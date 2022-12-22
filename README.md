# habitica_custom_attributes

this is a script that makes custom attributes easier on habitica. it designed to follow something like 
[The keep: custom attributes](https://habitica.fandom.com/wiki/The_Keep:Custom_attributes)

current the system works like habitica cron system and should only be setup to trigger once a day!! 



to use put in habitica user id, habitica api token and tags/attributes you want to use for it. 
in the top constants,  
run the setup habits  function via script interface. 
then set a trigger to every day at __ hr 
right before you would normally cron. 
for example if your cron is midnight set it to 11pm
or if your was 3am like mine set it to 2am. 

follow the [Event-Driven (Webhook) Scripts Setup Guide](https://habitica.fandom.com/wiki/Event-Driven_(Webhook)_Scripts_Setup_Guide)
note you must run generateHabits first than setup a time trigger for updateCustomAll. 

once setup the habits will look something like this
![example habit levels](https://github.com/warlord500/habitica_custom_attributes/blob/main/Capture.PNG)
every task tagged with your particular attribute when the code runs will contribute to your xp and levels. 

plans for the future: 

switch to webhook instead of cron system.   
~~support todos!~~  
~~support habits!~~  
support booster rewards!!  
better docs evantually!  

