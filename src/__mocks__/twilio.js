module.exports = {
  Twilio: jest.fn(() => {
    return {
      messages: {
        create: jest.fn(() => Promise.resolve()),
      },
    };
  }),
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
  webhook: jest.fn(() => (req, res, next) => next()),
};
