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
    const playbackInfo = getPlaybackInfo(handlerInput);
    const request = handlerInput.requestEnvelope.request;
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
	console.log(request);
	
	if(request.type === 'IntentRequest' &&
      	(
      		request.intent.name === 'AMAZON.StopIntent' ||
        	request.intent.name === 'AMAZON.CancelIntent' ||
        	request.intent.name === 'AMAZON.PauseIntent'
        )
      ) {
        	return true;
       	} else {
        	return false;
        }
  },
  handle(handlerInput) {
    return controller.stop(handlerInput);
  },
};

const ResumePlaybackHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
	console.log(request);
	
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
    	return controller.play(handlerInput);
      },
  };

const YesHandler = {
  canHandle(handlerInput) {
    const playbackInfo = getPlaybackInfo(handlerInput);
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
    const playbackInfo = getPlaybackInfo(handlerInput);
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
    return handlerInput.responseBuilder
      .speak('Goodbye!')
      .getResponse();
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
    console.log(`Error handled: ${error}`);
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

const SavePersistentAttributesResponseInterceptor = {
  process(handlerInput) {
    handlerInput.attributesManager.savePersistentAttributes();
  },
};

/* HELPER FUNCTIONS */

function getPlaybackInfo(handlerInput) {
  const attributes = handlerInput.attributesManager.getPersistentAttributes();
  return attributes.playbackInfo;
}

function canThrowCard(handlerInput) {
  const {
    requestEnvelope,
    attributesManager
  } = handlerInput;
  const playbackInfo = getPlaybackInfo(handlerInput);

  if (requestEnvelope.request.type === 'IntentRequest' && playbackInfo.playbackIndexChanged) {
    playbackInfo.playbackIndexChanged = false;
    return true;
  }
  return false;
}

const controller = {
  play(handlerInput) {
    const {
      attributesManager,
      responseBuilder
    } = handlerInput;

    const requestAttributes = handlerInput.attributesManager.getRequestAttributes();
    let streamName = handlerInput.requestEnvelope.request.intent.name;
    let streamUrl = audioData.get(streamName);

    var playBehavior = 'REPLACE_ALL';
    var playerMessage = requestAttributes.t(streamName + '_NOW_PLAYING');
	var reprompt = requestAttributes.t('REPROMPT_MESSAGE');

    responseBuilder
      .speak(playerMessage)
      .addAudioPlayerPlayDirective(playBehavior, streamUrl, streamName, 0, null);
    return responseBuilder.getResponse();
  },
  stop(handlerInput) {
    return handlerInput.responseBuilder
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

function getToken(handlerInput) {
  // Extracting token received in the request.
  return handlerInput.requestEnvelope.request.token;
}

function getIndex(handlerInput) {
  // Extracting index from the token received in the request.
  const tokenValue = parseInt(handlerInput.requestEnvelope.request.token, 10);
  const attributes = handlerInput.attributesManager.getPersistentAttributes();

  return attributes.playbackInfo.playOrder.indexOf(tokenValue);
}

function getOffsetInMilliseconds(handlerInput) {
  // Extracting offsetInMilliseconds received in the request.
  return handlerInput.requestEnvelope.request.offsetInMilliseconds;
}

function shuffleOrder() {
  const array = [...Array(constants.audioData.length).keys()];
  let currentIndex = array.length;
  let temp;
  let randomIndex;
  // Algorithm : Fisher-Yates shuffle
  return new Promise((resolve) => {
    while (currentIndex >= 1) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temp = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temp;
    }
    resolve(array);
  });
}

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
  .addRequestInterceptors(LocalizationInterceptor)
  .addResponseInterceptors(SavePersistentAttributesResponseInterceptor)
  .addErrorHandlers(ErrorHandler)
  .withAutoCreateTable(true)
  .withTableName(constants.skill.dynamoDBTableName)
  .lambda();