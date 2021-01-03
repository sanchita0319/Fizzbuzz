module.exports = {
    en: {
        translation: {
            INSTRUCTION_MSG: 'Welcome to Fizz Buzz! We\'ll each take turns counting up from one. You must replace numbers divisible by 3 with the word "fizz" and you must replace numbers divisible by 5 with the word "buzz". If a number is divisible by both 3 and 5, you should say "fizz buzz." If you get one wrong, you lose. When you\'re ready, say Play and I will start counting first. To hear the instructions now or anytime during the game, say Help. To exit the game, say Stop.',
            PLAY_MSG: 'I\'ll start. One.',
            FALLBACK_GAME_MSG: 'Invalid input. Please say a number, fizz, buzz, or fizzbuzz.',
            FALLBACK_NOT_GAME_MSG: 'Invalid input. Please say, HELP, PLAY, or STOP.',
            REPROMPT_MSG: `I said {{answer}}. Please say a number, fizz, buzz, or fizz buzz.`,
            INCORRECT_MSG: `The correct answer was {{answer}}. Your current highest number reached is {{high}}. Thank you for playing Fizz Buzz.`,
            STOP_MSG: 'You have exited the game. Thank you for playing Fizz Buzz',
            ERROR_MSG: 'Sorry, I had trouble doing what you asked. Please try again.',
            REFLECTOR_MSG: `You just triggered {{intentName}}`
        }
    }
}
