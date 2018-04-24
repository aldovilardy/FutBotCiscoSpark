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

            convo.addQuestion({
                text: '{{vars.name}}, enviame tu foto por favor.'
            }, function (res, convo) {
                // photo has been collected...
                if (res.data.files) {
                    bot.retrieveFileInfo(res.data.files[0], function (err, file_info) {
                        if (file_info['content-type'].includes('image/')) {
                            
                            convo.setVar('photoInfo', {
                                'filename': file_info.filename,
                                'content-type': file_info['content-type'],
                                'content-length': file_info['content-length'],
                                'cache-control': file_info['cache-control'],
                                'connection': file_info['connection'],
                                'content-disposition': file_info['content-disposition'],
                                'date': file_info['date'],
                                'l5d-success-class': file_info['l5d-success-class'],
                                'server': file_info['server'],
                                'strict-transport-security': file_info['strict-transport-security'],
                                'trackingid': file_info['trackingid'],
                                'via': file_info['via'],
                                'ciscoSparkUrl': res.data.files[0]
                            });
                            convo.gotoThread('confirm-photo');
                        }
                        else {
                            convo.gotoThread('error-photo');
                        }
                    });
                }
                else {
                    convo.say(`No se puede capturar adjunto.`);
                    convo.gotoThread('error-photo');
                }
            }, {key: 'photo-result'}, 'ask-photo');

            convo.addMessage({
                text: '{{vars.name}}, necesito que por favor me envíes una foto. Vamos a intentarlo de nuevo.',
                action: 'ask-photo'
            }, 'error-photo');
            

            convo.addMessage({
                text: '{{vars.name}}, el nombre de la imagen es: {{vars.photoInfo.filename}}. La URL cisco spark para trabajar es: {{vars.photoInfo.ciscoSparkUrl}}'
            }, 'confirm-photo');

            // now, define a function that will be called AFTER the `default` thread ends and BEFORE the `completed` thread begins


        })
    });
}

