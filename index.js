/*
 * Copyright 2018-2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

// sets up dependencies
const Alexa = require('ask-sdk-core');
const i18n = require('i18next');
const languageStrings = require('./languageStrings');
const sprintf = require('i18next-sprintf-postprocessor');
/* personalization Utility */
const personalizationUtil = require('./personalizationUtil')
const personalizationStorageUtil = require('./personalizationStorageUtil')
const aplDoc = require('./documents/facts.json');
const DEFAULT_TOPIC = "SPACE"
const FOOTBALL = "FOOTBALL"
const SOCCER = "Soccer"
const FOOTBALL_FACT_LOOKUP = "FOOTBALL_FACTS"
const SPACE_FACT_LOOKUP = "SPACE_FACTS"
let index=1;

/**
 * Core functionality for fact skill
 * 
 * Gives fact based on Intent value
 * Else if Intent value not passed and personlized factTopic is set use that
 * Else default to space facts.
*/



const questions = [  {    question: 'What is the capital of France?',    options: ['A. Paris', 'B. Berlin', 'C. London', 'D. Madrid'],
    answer: 'A'
  },
  {
    question: 'What is the largest planet in our solar system?',
    options: ['A. Jupiter', 'B. Saturn', 'C. Mars', 'D. Neptune'],
    answer: 'A'
  },
  {
    question: 'Which artist painted the famous artwork "Starry Night"?',
    options: ['A. Leonardo da Vinci', 'B. Vincent van Gogh', 'C. Pablo Picasso', 'D. Michelangelo'],
    answer: 'B'
  },
  {
    question: 'What is the highest mountain in the world?',
    options: ['A. Mount Everest', 'B. Mount Kilimanjaro', 'C. Mount Fuji', 'D. Mount McKinley'],
    answer: 'A'
  },
  {
    question: 'What is the name of the first man to walk on the moon?',
    options: ['A. Buzz Aldrin', 'B. Neil Armstrong', 'C. Yuri Gagarin', 'D. Alan Shepard'],
    answer: 'B'
  }
];


const QuizStartHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = `Welcome to the quiz! Are you ready to test your knowledge?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const QuizReadyHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuizReadyIntent';
  },
  handle(handlerInput) {
    const answer = Alexa.getSlotValue(handlerInput.requestEnvelope, 'answer');

    if (answer === 'yes') {
         const currentQuestion = questions[0];
     let speechText = '';

    
     speechText += 'Great! Let\'s start the quiz. ';
    speechText += `${currentQuestion.question} `;
    speechText += `Is it ${currentQuestion.options.join(', ')}? `;

      const sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
      sessionAttributes.currentQuestion = 0;
      sessionAttributes.correctAnswers = 0;
      sessionAttributes.currentQuestionIndex=1;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    } else if (answer === 'no') {
      const speechText = `Okay, no problem. Let me know when you're ready.`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    } else {
      const speechText = `Sorry, I didn't catch that. Are you ready to test your knowledge?`;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }
  }
};

const QuizDescriptionHandler = {
  canHandle(handlerInput) {
    return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
      && Alexa.getIntentName(handlerInput.requestEnvelope) === 'QuizDescriptionIntent';
  },
  handle(handlerInput) {
    const speechText = `This quiz will test your knowledge on a variety of topics. You will be asked a series of multiple-choice questions, and you will need to respond with the letter of the correct answer. Are you ready to begin?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  }
};

const QuizHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'QuizIntent';
  },
  handle(handlerInput) {
    let currentQuestionIndex = handlerInput.attributesManager.getSessionAttributes().currentQuestionIndex;
    const currentQuestion = questions[index];
    const ans=questions[index-1];

    let speechText = '';

    if (currentQuestionIndex === 0) {
      speechText += 'Welcome to the quiz! ';
      speechText += 'This quiz will ask you 5 multiple choice questions to test your knowledge. ';
      speechText += 'Are you ready to start? ';
    } else {
      const previousAnswer = handlerInput.requestEnvelope.request.intent.slots.answers.value;
      const isCorrect = previousAnswer.toUpperCase() === ans.answer;

      if (isCorrect) {
        speechText += 'Correct! ';
      } else {
        speechText += `Incorrect. The correct answer is ${ans.answer}. `;
      }
     index=index+1;
    }

    if (index < questions.length) {
      speechText += `${currentQuestion.question} `;
      speechText += `Is it ${currentQuestion.options.join(', ')}? `;

      const repromptText = 'I didn\'t catch that. Can you please say the letter of the correct answer?';

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(repromptText)
        .getResponse();
    } else {
      speechText += 'You have reached the end of the quiz. ';
      speechText += 'Thank you for playing!';

      return handlerInput.responseBuilder
        .speak(speechText)
        .getResponse();
    }
  },
};



exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    QuizStartHandler,
    QuizReadyHandler,
    QuizDescriptionHandler,
    QuizHandler
  )
  .lambda();