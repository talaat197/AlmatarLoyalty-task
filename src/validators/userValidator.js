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

const validateTransferPoints = ({pointsToTransfer , fromUser , toUser}) => {
  if(!pointsToTransfer || (pointsToTransfer > fromUser.points))
  {
    throw new Error('Not enough points to transfer');
  }
  
  if(fromUser._id.toString() === toUser._id.toString())
  {
    throw new Error('Cannot send points to yourself.');
  }

  if(!toUser)
  {
    throw new Error('User to transfer points not found.');
  }
}
module.exports = {
  validateEmail,
  validateTransferPoints
};
