"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var urls_1 = __importDefault(require("./urls"));
var formatPhone = function (phone) {
    return phone.substring(2);
};
var regionKey = {
    EAST_OAKLAND: 'East Oakland',
    WEST_OAKLAND: 'West Oakland',
};
var SIGN_UP_WORDS = ['signup', 'enroll', 'start', 'unstop', 'yes'];
var CANCEL_WORDS = [
    'stop',
    'stopall',
    'unsubscribe',
    'quit',
    'cancel',
    'end',
];
var INFO_WORD = 'info';
var MEAL_SURVEY_URL = urls_1.default.client + '/forms/meal-survey';
var SIGNUP_SURVEY_URL = urls_1.default.client + '/forms/text-signup-survey';
var signUpResponse = function (region, phone) {
    return "Thank you for signing up for " + regionKey[region] + " meal notifications! If you are able to complete our short survey, we won't share your data and it helps greatly with funding to provide free meals to the people: " + (SIGNUP_SURVEY_URL + '?phone=' + formatPhone(phone));
};
var duplicateResponse = function (region) {
    return "Your phone number is already on the list for " + regionKey[region] + " meal notifications.";
};
var feedbackResponse = function (phone) {
    return "Thank you for your feedback. A team member will review your message soon. If you want to fill out a survey about your experience with Community Kitchens, please follow this link: " + (MEAL_SURVEY_URL + '?phone=' + formatPhone(phone));
};
var generalInfoResponse = function (region) {
    return "This is the Community Kitchens text service for " + regionKey[region] + " meal notifications. Send the word \"" + SIGN_UP_WORDS[0] + "\" to sign up for alerts. Send the word \"" + CANCEL_WORDS[0] + "\" to stop receiving texts from this number.";
};
var dropOffResponse = 'Thank you for notifying CK staff of your meal drop off! We will send out an alert about this drop off to the people on our notification list.';
exports.default = {
    SIGN_UP_WORDS: SIGN_UP_WORDS,
    CANCEL_WORDS: CANCEL_WORDS,
    INFO_WORD: INFO_WORD,
    signUpResponse: signUpResponse,
    duplicateResponse: duplicateResponse,
    feedbackResponse: feedbackResponse,
    generalInfoResponse: generalInfoResponse,
    dropOffResponse: dropOffResponse,
};
