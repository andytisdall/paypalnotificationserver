module.exports = {
  webhook: jest.fn(() => (req, res, next) => next()),
  twiml: {
    MessagingResponse: jest.fn(() => {
      return {
        message: jest.fn((msg) => {
          this.message = msg;
        }),
        toString: jest.fn(() => this.message),
      };
    }),
  },
  Twilio: jest.fn((TWILIO_ID, TWILIO_AUTH_TOKEN, { autoRetry: boolean }) => ({
    messages: {
      create: jest.fn(() => {}),
    },
  })),
};
