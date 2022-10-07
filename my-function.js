// Google Cloud Function

exports.helloWorld = (req, res) => {
    let resString = "Jay says " + req.query.keyword;
    res.status(200).json(resString);
  };