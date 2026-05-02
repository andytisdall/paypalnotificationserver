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
};
