const jwt = require('jsonwebtoken');
const { jsonRespnse } = require("../utils/response");
const User = require('../models/user');
const {TOKEN_TYPE} = require('../utils/constants');

const auth = async (req , res , next) => {
    try {
        const token = req.header('Authorization').replace(`${TOKEN_TYPE} `, '')
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        let user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        if (!user) {
            throw new Error()
        }
        req.token = token
        req.user = user
        next()
    } catch (error) {
        res.status(401).send(jsonRespnse({message : "Invalid Authentication"}))
    }
}

module.exports = {
    auth
}