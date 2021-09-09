const express = require('express')
const UserController = require('../controllers/user')
const { auth } = require('../middlewares/auth')
const router = new express.Router()


router.post('/login' , UserController.login)
router.post('/signup' , UserController.signup)
router.post('/transfer/' , auth , UserController.transferPoints)
router.post('/confirm-transfer/' , auth , UserController.confirmTransfer)

module.exports = router
