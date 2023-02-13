export default {
  Twilio: jest.fn(() => {
    return {
      messages: {
        create: jest.fn(() => Promise.resolve()),
      },
    };
  }),

  webhook: jest.fn(() => (req, res, next) => next()),
};

export const twiml = {
  MessagingResponse: jest.fn(() => {
    return {
      message: jest.fn((msg) => {
        this.message = msg;
      }),
      toString: jest.fn(() => this.message),
    };
  }),
};
