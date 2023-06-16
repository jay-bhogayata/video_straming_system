const asyncHandler = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    res.status(500 || error.code).json({
      success: "false",
      message: error.message,
    });
  }
};

export default asyncHandler;
