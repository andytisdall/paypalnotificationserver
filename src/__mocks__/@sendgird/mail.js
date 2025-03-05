export default {
  setApiKey: jest.fn((key) => {}),
  send: jest.fn((msg) => {
    return Promise.resolve();
  }),
};
