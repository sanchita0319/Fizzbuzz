/* *
 * Started with the Amazon Hello World Boilerplate code
 * */
 
const Alexa = require('ask-sdk-core');
// i18n library dependency, we use it below in a localisation interceptor
const i18n = require('i18next');

//Gets the english strinsg that Alexa will say
const languageStrings = require('./en');

var persistenceAdapter = getPersistenceAdapter();


function getPersistenceAdapter(tableName) {
    // This function is an indirect way to detect if this is part of an Alexa-Hosted skill
        const {S3PersistenceAdapter} = require('ask-sdk-s3-persistence-adapter');
        return new S3PersistenceAdapter({
            bucketName: process.env.S3_PERSISTENCE_BUCKET
        });
   } 

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

/* FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        var speechText;
        if (handlerInput.attributesManager.getSessionAttributes().status) {
            speechText = handlerInput.t('FALLBACK_GAME_MSG');
        }
        else {
            speechText = handlerInput.t('FALLBACK_MSG');
        }
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speechText;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
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
        var answer = result(sessionAttributes.number).toString();
        //Verifies that the user's input is the same as the result from the function result
        if (word && word === answer|| number && number.toString() === answer) {
            //In that case, we increase the curr number by 1 and alexa provides the next answer
            sessionAttributes.number += 1;
            answer = result(sessionAttributes.number).toString();
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
            if (checkMax(persistentAttributes.high, sessionAttributes.number)) {
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


/*This provides instructions if the user says Help */

const RepeatIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.RepeatIntent';
    },
    handle(handlerInput) {
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        const speakOutput = sessionAttributes.prev;
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
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
        /*
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        */
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
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speakOutput;
        sessionAttributes.status = false;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        return handlerInput.responseBuilder
            .speak(speakOutput)
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
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
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
        var sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.prev = speakOutput;
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/*This function determines the currect response based on the current number */
function result(number) {
    if (number % 3  === 0 && number % 5 === 0)
    {
        return "fizzbuzz";
    }
    else if (number % 3 === 0)
    {
        return "fizz";
    }
    else if (number % 5 === 0)
    {
        return "buzz";
    }
    else
    {
        return number;
        
    }
}

function checkMax(num1, num2)
{
    if (!num1) {
        return true;
    }
    else if (num1 === num2) {
        return false;
    }
    else if (num2 > num1) {
        return true;
    }
    
    else {
        return false;
    }
    
}

/*This localization request interceptor determines the language and uses the appropriate language file */
const LocalisationRequestInterceptor = {
    process(handlerInput) {
        i18n.init({
            lng: Alexa.getLocale(handlerInput.requestEnvelope),
            resources: languageStrings
        }).then((t) => {
            handlerInput.t = (...args) => t(...args);
        });
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
        HelpIntentHandler,
        RepeatIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addRequestInterceptors(
        LocalisationRequestInterceptor)
    .addErrorHandlers(
        ErrorHandler)
    .withPersistenceAdapter(persistenceAdapter)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();
