'use strict';

var Bot = require('node-telegram-bot'),
    config = require('../config/config.js');

var telegramPlatform = function (babbot) {
    var self = this;

    self.typing = function (state) {
        self.botInstance.sendChatAction(
            {
                chat_id: state.message.chat.id,
                action: 'typing'
            },
            function (nodifiedPromise) {
            }
        );
    };

    self.message = function (text, state) {
        var whenDone = function(nodifiedPromise) {};
        if(text.length > 4096) //This is an undocumented maximum message length of the Telegram API. Message sending will fail without exceptions if anything longer than this is sent
        {
            var lineBreak = text.lastIndexOf("\n",4096);
            if(lineBreak === -1)
            {
                var remainder = text.slice(4096,text.length-1);
                text = text.slice(0,4096);
            } else {
                var remainder = text.slice(lineBreak+1,text.length-1);
                text = text.slice(0,lineBreak);
            }
            var whenDone = function(nodifiedPromise){
                self.message(remainder,state);
            }
        }

        self.botInstance.sendMessage(
            {
                chat_id: state.message.chat.id,
                text: text,
                reply_to_message_id: state.message.message_id,
            },
            whenDone
        ); 
    };

    self.failMessage = function (text, state) {
        self.botInstance.sendMessage(
            {
                chat_id: state.message.chat.id,
                text: text,
                reply_to_message_id: state.message.message_id,
            },
            function (nodifiedPromise) {
            }
        );
    };

    self.debug = function (obj, state) {
        console.log(obj);
    };

    self.error = function (err, state) {
        console.error(err);
    };

    self.botInstance = new Bot({ token: config.telegram.token });

    self.botInstance.on('message', function (message) {
        if(message !== undefined)
        {
            if(message.text){
                var parameters = message.text.split(' ');
            }
            var state = {
                message: message,
                parameters : parameters
            };

            self.debug(state);

            babbot.onMessage(self, state.parameters, state);
        }
    });

    self.botInstance.start();
};

module.exports = telegramPlatform;
