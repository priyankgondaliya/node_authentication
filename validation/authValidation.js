const { check } = require("express-validator");

const registerValidation = [
  check("name", "Name is required").notEmpty(),
  check("email", "Invalid email").isEmail(),
  check("password", "Password must be at least 6 characters long").isLength({ min: 6 }),
];

const loginValidation = [
  check("email", "Invalid email").isEmail(),
  check("password", "Password is required").notEmpty(),
];
const changePasswordValidation = [
    check("oldPassword", "Old password is required").notEmpty(),
    check("newPassword", "New password must be at least 6 characters long").isLength({ min: 6 }),
  ];

module.exports = {
  registerValidation,
  loginValidation,
  changePasswordValidation
};
