module.exports = {
  deleteFile: jest.fn(async (name) => {
    await Promise.resolve();
  }),
  storeFile: jest.fn(async ({ file, name }) => {
    return await new Promise((resolve) => resolve("url"));
  }),
};
