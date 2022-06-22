# habitica_custom_attributes

this is a script that makes custom attributes easier on habitica. it designed to follow something like 
[The keep: custom attributes](https://habitica.fandom.com/wiki/The_Keep:Custom_attributes)

current the system works like habitica cron system and should only be setup to trigger once a day!! 

currently only accounts for dailies and not completedTodos or habits! 


to use put in habitica user id, habitica api token and tags/attributes you want to use for it. 
follow the [Event-Driven (Webhook) Scripts Setup Guide](https://habitica.fandom.com/wiki/Event-Driven_(Webhook)_Scripts_Setup_Guide)
note you must run generateHabits first than setup a time trigger for updateCustomAll. 


every task tagged with your particular attribute when the code runs will contribute to your xp and levels. 

plans for the future: 

switch to webhook instead of cron system. 
support todos! 
support habits!
support booster rewards!! 
better docs evantually! 

