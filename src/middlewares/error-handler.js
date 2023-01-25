module.exports = {
  errorHandler: (err, req, res, next) => {
    console.error(err);
    if (err.response?.data) {
      console.log(err.response.data);
    }
    if (res.statusCode === 200) {
      res.status(400);
    }
    res.send({ error: err.message });
  },
};
