var validator = require("email-validator");
var date_format = require('dateformat');
fs = require('fs');
const exec = require('child_process').exec;
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
                        var validFile = (file_info['content-type'].includes('image/'));
                        if (file_info['content-type'].includes('image/')) {
                            console.log('Antes de retrieve!');
                            bot.retrieveFile(res.data.files[0], function (err, file) {
                                //
                                // Write file to filesystem
                                //
                                console.log('Entro a Retieve!');
                                var response = writePhoto('public/AttachedFiles/', file_info['filename'], file);
                                convo.setVar('internalUrlPhoto', `${process.env.PUBLIC_URL}/${file_info.filename}`);
                                convo.setVar('internalPhotoFileName', file_info.filename);
                                console.log('Va para confirm-photo!');
                                convo.gotoThread('confirm-photo');
                            });

                            // convo.gotoThread('confirm-photo');
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
            }, { key: 'photo-result' }, 'ask-photo');

            convo.addMessage({
                text: '{{vars.name}}, necesito que por favor me envíes una foto. Vamos a intentarlo de nuevo.',
                action: 'ask-photo'
            }, 'error-photo');

            convo.beforeThread('confirm-photo', function (convo, next) {

                //
                // Create the sticker
                // Windows style
                //
                var sticker_photo_input = 'public/AttachedFiles/' + convo.vars.internalPhotoFileName;
                var sticker_photo_output = 'public/AttachedFiles/' + convo.vars.internalPhotoFileName.slice(0, -4) + "_sticker.png";
                var sticker_command_first = 'convert public/AttachedFiles/mask_col.png \( "' + sticker_photo_input + '" -resize 1536x2048^ \) -compose overlay -composite public/AttachedFiles/mask_col.png -composite public/AttachedFiles/outtemp.png';

                var sticker_command_last = 'convert public/AttachedFiles/outtemp.png -font Whitney-Semibold -weight 700  -pointsize 70 -draw "fill black text 300,1860 \'' + convo.vars.name.toUpperCase();
                sticker_command_last += '\' " -pointsize 50 -draw "gravity northeast fill black text 100,1900 \'' + 'CALLTECH S.A.';
                sticker_command_last += '\' " -pointsize 50 -draw "gravity northeast fill black text 800,1710 \'' + '20-04-2018';
                sticker_command_last += '\' " -pointsize 50 -draw "gravity northeast fill black text 200,315 \'' + '2018';
                sticker_command_last += '\' " ' + sticker_photo_output;

                //
                // Execute the first command
                //
                console.log(">>>Command1 Start: " + date_format(new Date(), "h:MM:ss"));
                console.log("Command: " + sticker_command_first);
                var imageMagick_first = exec(sticker_command_first,
                    (error, stdout, stderr) => {
                        console.log(`${stdout}`);
                        console.log(`${stderr}`);
                        console.log(">>>Command1 End: " + date_format(new Date(), "h:MM:ss"));

                        //
                        // Execute the second public/AttachedFiles/outtemp.png
                        //
                        console.log(">>>Command2 Start: " + date_format(new Date(), "h:MM:ss"));
                        console.log("Command: " + sticker_command_last);
                        var imageMagick_last = exec(sticker_command_last,
                            (error, stdout, stderr) => {
                                console.log(`${stdout}`);
                                console.log(`${stderr}`);
                                console.log(">>>Command End: " + date_format(new Date(), "h:MM:ss"));

                                //
                                // Save the Sticker Image
                                //
                                convo.setVar('internalUrlSticker', `${process.env.PUBLIC_URL}/${convo.vars.internalPhotoFileName.slice(0, -4)}_sticker.png`);  
                                var dummy;                              

                                if (error !== null) {
                                    console.log(`exec error: ${error}`);
                                    convo.gotoThread('error-photo');
                                }
                            });

                        if (error !== null) {
                            console.log(`exec error: ${error}`);
                            convo.gotoThread('error-photo');
                        }
                        else{
                            next();
                        }
                    });
                

            }).catch(function (err) {
                convo.setVar('error', err);
                convo.gotoThread('error-photo');
                next(err); // pass an error because we changed threads again during this transition
            });

            convo.addMessage({
                text: '{{vars.name}}, <BR/>La URL interna de la foto es: {{vars.internalUrlPhoto}}. <BR/>La URL del Sticker es: {{vars.internalUrlSticker}}'
            }, 'confirm-photo');

            // now, define a function that will be called AFTER the `default` thread ends and BEFORE the `completed` thread begins


        })
    });
}


function writePhoto(path, filename, buffer) {
    fs.writeFile(path + filename, buffer, 'binary', function (err) {
        if (err) throw err;
        console.log('It\'s saved!');

    });

    return true;
}