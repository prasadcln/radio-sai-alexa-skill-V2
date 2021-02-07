/* eslint-disable  func-names */
/* eslint-disable  no-console */
/* eslint-disable  no-restricted-syntax */
/* eslint-disable  consistent-return */

var i18n = require('i18next');
var sprintf = require('i18next-sprintf-postprocessor');

const alexa = require('ask-sdk');
const constants = require('./constants');
const audioData = require('./audioAssets');



/* INTENT HANDLERS */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let message;
    let reprompt;

   message = requestAttributes.t('WELCOME_MESSAGE');
   reprompt = requestAttributes.t('REPROMPT_MESSAGE');

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(reprompt)
      .getResponse();
  },
};

const CheckAudioInterfaceHandler = {
  canHandle(handlerInput) {
    const audioPlayerInterface = ((((handlerInput.requestEnvelope.context || {}).System || {}).device || {}).supportedInterfaces || {}).AudioPlayer;
    return audioPlayerInterface === undefined
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak('Sorry, this skill is not supported on this device')
      .withShouldEndSession(true)
      .getResponse();
  },
};

const AllIntentsHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let streamName;

    streamName = requestAttributes['stream'];
    streamUrl = audioData.get(streamName);

    if (request.type === 'IntentRequest' && 
		( request.intent.name === 'BhajanStream' ||
			request.intent.name === 'DiscourseStream' ||
			request.intent.name === 'AmeriStream' ||
			request.intent.name === 'AsiaStream' ||
			request.intent.name === 'AfriStream' ||
			request.intent.name === 'TeluguStream'
		)
    ) {
      return true;
    } else {
      return false;
    }
  },
  handle(handlerInput) {
    return controller.play(handlerInput);
  },
};

const PausePlaybackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
	if(request.type === 'IntentRequest' &&
      	(
        	request.intent.name === 'AMAZON.PauseIntent'
        )
      ) {
        	return true;
       	} else {
        	return false;
        }
  },
  handle(handlerInput) {
    return controller.pause(handlerInput);
  },
};

const ResumePlaybackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
	if(request.type === 'IntentRequest' &&
      	(
      		request.intent.name === 'AMAZON.ResumeIntent'
        )
      ) {
        	return true;
       	} else {
        	return false;
        }
	  },
	  handle(handlerInput) {
    	return controller.resume(handlerInput);
      },
  };

const YesHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
  	if(request.type === 'IntentRequest' &&
  		request.intent.name === 'AMAZON.YesIntent')
  	{
  		return true;
  	} else {
  		return false;
  	}
  },
  handle(handlerInput) {
    return controller.play(handlerInput);
  },
};

const NoHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;

  	if(request.type === 'IntentRequest' &&
  		request.intent.name === 'AMAZON.NoIntent')
  	{
  		return true;
  	} else {
  		return false;
  	}
  },
  handle(handlerInput) {
    return controller.play(handlerInput);
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    if(handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
      	handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent')
    {
    	return true;
    } else {
    	return false;
    }
  },
  handle(handlerInput) {
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let message;

    message = requestAttributes.t('HELP_MESSAGE');

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    if(request.type === 'IntentRequest' &&
      	(request.intent.name === 'AMAZON.StopIntent' ||
        	request.intent.name === 'AMAZON.CancelIntent'))
	{
    	return true;
    } else {
    	return false;
    }    	
  },
  handle(handlerInput) {
      return controller.stop(handlerInput, 'Goodbye!');  
  },
};

const SystemExceptionHandler = {
  canHandle(handlerInput) {
    if(handlerInput.requestEnvelope.request.type === 'System.ExceptionEncountered')
    {
    	return true;
    } else {
    	return false;
    }
  },
  handle(handlerInput) {
    console.log(`System exception encountered: ${handlerInput.requestEnvelope.request.reason}`);
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    if(handlerInput.requestEnvelope.request.type === 'SessionEndedRequest')
    {
    	return true;
    } else {
    	return false;
    }
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
    return handlerInput.responseBuilder.getResponse();
  },
};
const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled for input ${handlerInput}, error is ${error}`);
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    const message = requestAttributes.t('ERROR_MESSAGE');

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};

/* INTERCEPTORS */

const LocalizationInterceptor = {
    process( handlerInput) {
        // Gets the locale from the request and initializes i18next.
        const localizationClient = i18n.use(sprintf).init({
            lng: handlerInput.requestEnvelope.request.locale,
          resources: constants.languageStrings
        });

    // Creates a localize function to support arguments.
    localizationClient.localize = function localize() {
        // gets arguments through and passes them to
        // i18next using sprintf to replace string placeholders
        // with arguments.
        const args = arguments;
        const values = [];
        for (let i = 1; i < args.length; i += 1) {
            values.push(args[i]);
        }
        const value = i18n.t(args[0], {
            returnObjects: true,
            postProcess: 'sprintf',
            sprintf: values
        });

        // If an array is used then a random value is selected
        if (Array.isArray(value)) {
            return value[Math.floor(Math.random() * value.length)];
        }
        return value;
    };
    // this gets the request attributes and save the localize function inside
    // it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
    const attributes = handlerInput.attributesManager.getRequestAttributes();
    attributes.t = function translate(...args) {
        return localizationClient.localize(...args);
    };
}
};

const LogRequestInterceptor = {
  process(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
	console.log(request);
  },
};

const SavePersistentAttributesResponseInterceptor = {
  process(handlerInput) {
    handlerInput.attributesManager.savePersistentAttributes();
  },
};

/* HELPER FUNCTIONS */

const controller = {
  play(handlerInput) {
    const {
      attributesManager,
      responseBuilder
    } = handlerInput;
    
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let streamName = handlerInput.requestEnvelope.request.intent.name;
    let streamUrl = audioData.get(streamName);

	let playerMessage = requestAttributes.t(streamName + '_NOW_PLAYING');
	let reprompt = requestAttributes.t('REPROMPT_MESSAGE');

    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.streamName = streamName;
    sessionAttributes.streamUrl = streamUrl;
	
    var playBehavior = 'REPLACE_ALL';
	
    console.log(playerMessage + streamUrl);
    responseBuilder
      .speak(playerMessage)
      .withShouldEndSession(false)
      .addAudioPlayerPlayDirective(playBehavior, streamUrl, streamName, 0, null);
    return responseBuilder.getResponse();
  },
  
  resume(handlerInput) {
    const {
      attributesManager,
      responseBuilder
    } = handlerInput;
  
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let streamName = sessionAttributes.streamName;
    let streamUrl = sessionAttributes.streamUrl;
    
    if(streamName == null) {
      const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
   	  let  message = requestAttributes.t('WELCOME_MESSAGE');
      let reprompt = requestAttributes.t('REPROMPT_MESSAGE');

	  return handlerInput.responseBuilder
        .speak(message)
        .reprompt(reprompt)
        .getResponse();
    }
    
    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let playerMessage = requestAttributes.t(streamName + '_NOW_PLAYING');
	let reprompt = requestAttributes.t('REPROMPT_MESSAGE');
    
    var playBehavior = 'REPLACE_ALL';
	
    console.log(playerMessage + streamUrl);
    responseBuilder
      .speak(playerMessage)
      .withShouldEndSession(false)
      .addAudioPlayerPlayDirective(playBehavior, streamUrl, streamName, 0, null);
    return responseBuilder.getResponse();
  },

  pause(handlerInput) {
    const {
      attributesManager,
      responseBuilder
    } = handlerInput;
  
    const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
    let streamName = sessionAttributes.streamName;
    let streamUrl = sessionAttributes.streamUrl;
  
    return responseBuilder
      .withShouldEndSession(false)
      .addAudioPlayerStopDirective()
      .getResponse();
  },

  stop(handlerInput, speakmessage) {
    return handlerInput.responseBuilder
      .speak(speakmessage)
      .withShouldEndSession(true)
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

const skillBuilder = alexa.SkillBuilders.standard();
exports.handler = skillBuilder
  .addRequestHandlers(
    CheckAudioInterfaceHandler,
    LaunchRequestHandler,
    HelpHandler,
    SystemExceptionHandler,
    SessionEndedRequestHandler,
    YesHandler,
    NoHandler,
    AllIntentsHandler,
    PausePlaybackHandler,
    ResumePlaybackHandler,
    ExitHandler
  )
  .addRequestInterceptors(LogRequestInterceptor, LocalizationInterceptor)
  .addResponseInterceptors(SavePersistentAttributesResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withAutoCreateTable(true)
  .withTableName(constants.skill.dynamoDBTableName)
  .lambda();