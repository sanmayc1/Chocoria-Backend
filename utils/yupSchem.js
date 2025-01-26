import { object, ref, string } from "yup";

const yupSchema = object({
  username: string()
    .trim()
    .min(2, "Enter a valid name")
    .matches(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters")
    .required("Name is required"),
  phone: string()
    .matches(/^[987]\d{9}$/, "Enter a valid phone number")
    .required("Phone Number is required"),
  email: string()
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Enter a valid email"
    )
    .required("Email is required"),
  password: string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must have a letter, number, & symbol"
    )
    .min(8, "Minimum 8 Characters")
    .required("Password is required"),
  confirmPassword: string()
    .required("Confirm password is required")
    .oneOf([ref("password"), null], "Passwords not match"),
});

export default yupSchema;
