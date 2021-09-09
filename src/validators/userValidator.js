const validator = require("validator");

const validateEmail = [
  {
    validator: function (value) {
      if (!validator.isEmail(value)) {
        return false;
      }
      return true;
    },
    message: (props) => `${props.value} is invalids`,
  },
];

module.exports = {
  validateEmail,
};
