const createAccount = (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    res.status(201).json({ message: "Registered successfully", status: true });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
const loginAccount = (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    res.status(201).json({ message: "Registered successfully", status: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  createAccount,
  loginAccount,
};
