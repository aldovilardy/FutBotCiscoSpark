//var name, error;
//var eMail;
module.exports = function (controller) {

    controller.hears(['richard'], 'direct_message,direct_mention', function (bot, message) {

        bot.startConversation(message, function (err, convo) {

        // create a thread that asks the user for their name.
        // after collecting name, call gotoThread('completed') to display completion message
        convo.addMessage({text: 'Hello let me ask you a question, then i will do something useful'},'default');
        convo.addQuestion({text: 'What is your name?'},function(res, convo) {
        // name has been collected...
        convo.gotoThread('completed');
        },{key: 'name'},'default');

        // create completed thread
        convo.addMessage({text: `I saved your name in the database, {{vars.name}}`},'completed');

        // create an error  thread
        convo.addMessage({text: 'Oh no I had an error! {{vars.error}}'},'errorThread');


        // now, define a function that will be called AFTER the `default` thread ends and BEFORE the `completed` thread begins
        convo.beforeThread('completed', function(convo, next) {

        var name = convo.extractResponse('name');
        var validator = require("email-validator");
        if (validator.validate(name)) {
            convo.setVar('name', name);
            convo.next();
            }
        else {
            convo.setVar('error', err);
            convo.gotoThread('errorThread');
            next(err); // pass an error because we changed threads again during this transition
        }

        // do something complex here
        /*
        myFakeFunction(name).then(function(results) {

            convo.setVar('results',results);

            // call next to continue to the secondary thread...
            next();

        }).catch(function(err) {
            convo.setVar('error', err);
            convo.gotoThread('error');
            next(err); // pass an error because we changed threads again during this transition
        });
        */
       next();

        });

            /*
            convo.say('¡Hola soy FutBot!');

            convo.ask('¿Cómo te llamas?', function (response, convo) {
                //name = response.text;
                convo.setVar('name', response.text);
                //convo.say(`Tu nombre es: ${name}`);

                convo.addQuestion(`¿Cual es tu correo?`, function (response, convo) {
                    //var validator = require("email-validator");
                    // if (validator.validate(response.text)) {
                    //     //eMail = response.text;
                    //     convo.setVar('eMail', response.text);
                    //     //convo.say(`El correo de ${name} es: ${eMail}`);
                    //     convo.next();
                    // }
                    // else {
                    //     convo.say(`Lo siento, ${response.text} no es una dirección de correo valida. Vamos a intentarlo de nuevo...`);
                    //     convo.gotoThread("ask-eMail");
                    // }
                    //convo.say(`El correo anterior es: ${eMail} y el nuevo es: ${response.text}`);
                    //eMail = response.text;
                    //convo.gotoThread("ask-eMail");
                    //convo.next();
    
                    convo.gotoThread('complete-eMail');
    
                }, {key: 'veMail'}, 'ask-eMail');

                // create completed thread
                //convo.addMessage({text: `I saved your email in the database, ${eMail}`},'complete-eMail');
                convo.addMessage({text: 'I saved your email in the database'},'complete-eMail');

                convo.beforeThread('complete-eMail',function(convo, next){
                    eMail = convo.extractResponse('veMail');
                });
            
   
                convo.gotoThread('ask-eMail');
              
                //convo.next();
            });

            convo.on('end', function (convo) {
                if (convo.status == 'completed') {
                    name = convo.vars["name"];
                    eMail = convo.var["eMail"];
                    if (name && eMail) {
                        console.log(`LOG: picked: ${name}`);
                        console.log(`LOG: picked: ${eMail}`);
                    } else {
                        console.log("LOG: **************SE MAMÓ**************");
                    }
                }
            });
            */

        })
    });
}

