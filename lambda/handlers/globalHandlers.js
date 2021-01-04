const Alexa = require('ask-sdk-core');

/* FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        let speechText;
        if (handlerInput.attributesManager.getSessionAttributes().status) {
            speechText = handlerInput.t('FALLBACK_GAME_MSG');
        }
        else {
            speechText = handlerInput.t('FALLBACK_NOT_GAME_MSG');
        }
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speechText;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};

/*This repeats Alexa's previous statement */
const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const speakOutput = sessionAttributes.prev;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/* This ends the game */
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('STOP_MSG');
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speakOutput;
        sessionAttributes.status = false;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

/*This provides instructions if the user says Help */
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = handlerInput.t('INSTRUCTION_MSG');
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};

/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = handlerInput.t('ERROR_MSG');
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = handlerInput.t('REFLECTOR_MSG', {intentName: intentName});
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

module.exports = {
    FallbackIntentHandler,
    RepeatIntentHandler,
    CancelAndStopIntentHandler,
    HelpIntentHandler,
    SessionEndedRequestHandler,
    ErrorHandler,
    IntentReflectorHandler
}
