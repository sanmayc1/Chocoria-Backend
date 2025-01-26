import yupSchema from "../utils/yupSchem.js";

const userDataValidation = async (req, res, next) => {
  try {
    await yupSchema.validate(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const validationErr = {};
    error.inner.forEach((err) => {
      validationErr[err.path] = err.message;
    });
    res.status(422).json({success:false,message:"validation error found ",validationErr})
  }
};
export default userDataValidation;
