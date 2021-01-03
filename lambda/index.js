/* *
 * Started with the Amazon Hello World Boilerplate code
 * */
const Alexa = require('ask-sdk-core');

//Contains handlers for common intents
const globalHandlers = require('./globalHandlers.js')

//Contains localisation receptor
const interceptors = require('./interceptors.js');

//Persistence Adaptor information
const util = require('./util');

//Contains functions used to make calculations for the correct value and to find the current maximum number
const logic = require('./logic')

/*This is the launch request handler for when the user first envokes the skill use the convocation name 'Sanchita game' */
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        //The instruction message provides the instructions for Fizz Buzz, the instruction is part of the language strings 
        const speakOutput = handlerInput.t('INSTRUCTION_MSG');
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        //This sets whether the game has begun or not. This is to allow for the correct reprompt message to be given
        sessionAttributes.status = false;
        //This keeps track of the previous message so that it can be used in the repeat intent
        sessionAttributes.prev = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};


/*This is the handler for when a user says 'Play'; Alexa says 'one' and prompts the user for the response */
const PlayIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PlayIntent';
    },
    handle(handlerInput) {
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        //Begin storing the current number in session Attributes
        sessionAttributes.number = 1;
        sessionAttributes.status = true;
        sessionAttributes.prev = handlerInput.t('PLAY_MSG');
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        if (sessionAttributes.number) {
            return handlerInput.responseBuilder
                .speak(handlerInput.t('PLAY_MSG'))
                .reprompt(handlerInput.t('PLAY_MSG'))
                .getResponse();
        }
    }
};

/*This is the main handler for the game functionality; it verifies that the user's input is the correct response and also provides the next response */
const AnswerIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AnswerIntent';
    },
    async handle(handlerInput) {
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        //Since we have two slots - numbers and fizz (fizz, buzz, or fizzbuzz), we get the values of both slots
        var number = Alexa.getSlotValue(handlerInput.requestEnvelope, 'number');
        var word = Alexa.getSlotValue(handlerInput.requestEnvelope, 'word');
        sessionAttributes.number += 1;
        //This variable stores the answer given by result; the result function is defined below
        var answer = logic.result(sessionAttributes.number).toString();
        //Verifies that the user's input is the same as the result from the function result
        if (word && word === answer|| number && number.toString() === answer) {
            //In that case, we increase the curr number by 1 and alexa provides the next answer
            sessionAttributes.number += 1;
            answer = logic.result(sessionAttributes.number).toString();
            sessionAttributes.prev = answer;
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            return handlerInput.responseBuilder
            .speak(answer)
            .reprompt(handlerInput.t('REPROMPT_MSG', {answer: answer}))
            .getResponse();
        }
        
        else
        {
            let {attributesManager} = handlerInput;
            let persistentAttributes = await attributesManager.getPersistentAttributes();
            if (logic.checkMax(persistentAttributes.high, sessionAttributes.number)) {
                persistentAttributes.high = sessionAttributes.number;
                 attributesManager.setPersistentAttributes(persistentAttributes);
                await attributesManager.savePersistentAttributes();
            }
            
            sessionAttributes.status = false;
            
            //If the answer is incorrect, the session ends
            return handlerInput.responseBuilder
                .speak(handlerInput.t('INCORRECT_MSG', {answer: answer, high: persistentAttributes.high}))
                .getResponse();
        }
    }
        
};


/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        PlayIntentHandler,
        AnswerIntentHandler,
        globalHandlers.HelpIntentHandler,
        globalHandlers.RepeatIntentHandler,
        globalHandlers.CancelAndStopIntentHandler,
        globalHandlers.FallbackIntentHandler,
        globalHandlers.SessionEndedRequestHandler,
        globalHandlers.IntentReflectorHandler)
    .addRequestInterceptors(
        interceptors.LocalisationRequestInterceptor)
    .addErrorHandlers(
        globalHandlers.ErrorHandler)
    .withPersistenceAdapter(util.getPersistenceAdapter())
    //.withPersistenceAdapter(persistenceAdapter)
    .withApiClient(new Alexa.DefaultApiClient())
    //.withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();