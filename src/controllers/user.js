const PointsTransaction = require("../models/pointsTransaction");
const User = require("../models/user");
const { TOKEN_TYPE, PAGE_LIMIT, PENDING } = require("../utils/constants");
const { sendPointsConfirmationMail } = require("../utils/Mailer");
const { jsonRespnse } = require("../utils/response");
const jwt = require('jsonwebtoken');
const { getPaginationResponse } = require("../utils/pagination");


const login = async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    
    const token = await user.generateAuthToken();
    res.send(jsonRespnse({ data: { user, token , token_type : TOKEN_TYPE} }));
  } catch (e) {
    res.status(400).send(jsonRespnse({ message: e.message }));
  }
};

const signup = async (req, res) => {
  try {
    const {user , token} = await User.createNewUser(req.body);

    res.status(201).send(
        jsonRespnse({ data: {user , token , token_type : TOKEN_TYPE}, message: "User signed up successuflly." })
      );
  } catch (e) {
    res.status(400).send(jsonRespnse({ message: e.message }));
  }
};

const transferPoints = async (req , res) => {
  try {
    const pointsToTransfer = req.body.points;
    const toUser = await User.findById(req.body.to);
    const fromUser = req.user;
    
    if(!pointsToTransfer || pointsToTransfer > fromUser.points)
    {
      throw new Error('Not enough points to transfer');
    }
    
    if(fromUser._id.toString() === toUser._id.toString())
    {
      throw new Error('Cannot send points to yourself.');
    }

    const transaction = await PointsTransaction.transfer(fromUser , toUser._id , pointsToTransfer);

    if(transaction && toUser)
    {
      const confirmationToken = transaction.generateConfirmationToken()
      await sendPointsConfirmationMail({to : toUser.email , fromEmail : fromUser.email , token : confirmationToken} , () => {
        transaction.delete();
      })
      setTimeout(async () => {
        const trans = await PointsTransaction.findOne({_id : transaction._id , status : PENDING}).populate('from');
        if(trans)
        {
          trans.declinePoints();
        }
      } , 600000)
    }

    res.status(200).send(
        jsonRespnse({ data: transaction , message: "Points transfered and waiting for email confimartion" })
      );
  } catch (e) {
    res.status(400).send(jsonRespnse({ message: e.message }));
  }
}

const confirmTransfer = async (req , res) => {
  try {
    const confirmToken = req.body.confirm_token;

    jwt.verify(confirmToken, process.env.JWT_SECRET_KEY , async (error , decoded) => {
      if(error && error.name === 'TokenExpiredError') {

        const {transactionId} = jwt.verify(confirmToken, process.env.JWT_SECRET_KEY, {ignoreExpiration: true} );
        const transaction = await PointsTransaction.findOne({_id : transactionId , status : PENDING}).populate('from');
        if(transaction)
        {
          transaction.declinePoints();
          return res.status(200).send(jsonRespnse({ data: transaction , message: "Points expired too late :(" }));
        }
      }
      else if(decoded){
        const transaction = await PointsTransaction.findOne({_id : decoded.transactionId , status : PENDING}).populate('to');

        if(transaction)
        {
          transaction.confirmPoints();
          return res.status(200).send(jsonRespnse({ data: transaction , message: "Points confirmed Wooho!" }));    
        }
      }
      
      return res.status(400).send(jsonRespnse({ data: {} , message: "Cannot confirm this transaction" }));
    })

  } catch (error) {
    res.status(400).send(jsonRespnse({ message: error.message }));
  }
}

const getPoints = async (req , res) => {
  try {
    const user = req.user;
    return res.status(200).send(jsonRespnse({ data: {points : user.points} , message: "" }));    
  } catch (error) {
    res.status(400).send(jsonRespnse({ message: error.message }));
  }
}

const getTransactions = async (req , res) => {
  try {
    const user = req.user;
    const limit = PAGE_LIMIT;
    const page = (req.query.page || 1) - 1;
    const filter = {
      $or: [
        { 'to': user._id },
        { 'from': user._id },
      ]
    };

    const transactions = await PointsTransaction.find(filter).populate('to from').skip(page * limit).limit(limit);

    const total = await PointsTransaction.find(filter).count();

    const pagination = getPaginationResponse(
      total,
      req.query.page,
      limit,
      total
    );

    return res.status(200).send(jsonRespnse({ data: {list : transactions , ...pagination} , message: "" }));    
  } catch (error) {
    res.status(400).send(jsonRespnse({ message: error.message }));
  }
}

module.exports = {
  login,
  signup,
  transferPoints,
  confirmTransfer,
  getPoints,
  getTransactions
};
