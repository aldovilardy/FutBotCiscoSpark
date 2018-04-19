module.exports = function (controller) {

    controller.hears(['jugar'], 'direct_message,direct_mention', function (bot, message) {

        bot.startConversation(message, function (err, convo) {

            // create a thread that asks the user for their name.
            // after collecting name, call gotoThread('completed') to display completion message
            convo.addMessage({ text: '¡Hola soy FutBot!' }, 'default');

            convo.addQuestion({ text: '¿Cómo te llamas?' }, function (res, convo) {
                // name has been collected...
                convo.gotoThread('say-name');
            }, { key: 'name' }, 'default');

            convo.beforeThread('say-name', function (convo, next) {
                var name = convo.extractResponse('name');
                convo.setVar('name', name);
                next();
            });

            convo.addMessage({
                 text: `Tu nombre es: {{vars.name}}`, 
                 action: 'ask-Email' 
                }, 'say-name');

            convo.addQuestion({ text: '¿Cual es tu correo?' }, function (res, convo) {
                // eMail has been collected...
                convo.gotoThread('say-eMail');
            }, { key: 'eMail' }, 'ask-Email');

            convo.beforeThread('say-eMail', function (convo, next) {
                var eMail = convo.extractResponse('eMail');
                var validator = require("email-validator");
                if (validator.validate(eMail)) {
                    convo.setVar('eMail', eMail);
                    next();
                }
                else {
                    convo.setVar('eMailError', eMail);
                    convo.gotoThread('eMailerrorThread');
                }
            });

            convo.addMessage({ 
                text: 'Lo siento {{vars.name}}, {{vars.eMailError}} no es una dirección de correo valida. Vamos a intentarlo de nuevo...',
                action: 'ask-Email'
            }, 'eMailerrorThread');

            convo.addMessage({ 
                text: `{{vars.name}}, Tu correo es: {{vars.eMail}}`,
                action: 'ask-photo' 
            }, 'say-eMail');            

            convo.addMessage({ 
                text: '{{vars.name}}, enviame tu foto por favor.',
                action: 'get-photo'
            }, 'ask-photo');

            convo.beforeThread('get-photo', function (convo, next) {
                var eMail = convo.extractResponse('eMail');
                var validator = require("email-validator");
                if (validator.validate(eMail)) {
                    convo.setVar('eMail', eMail);
                    next();
                }
                else {
                    convo.setVar('eMailError', eMail);
                    convo.gotoThread('eMailerrorThread');
                }
            });
            // now, define a function that will be called AFTER the `default` thread ends and BEFORE the `completed` thread begins
            

        })
    });
}

