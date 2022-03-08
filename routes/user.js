const express = require('express')

const router = express.Router()

const userController = require('../controllers/user')

router.get('/getusers', userController.getUsers)

router.post('/addnewusers', userController.postAddUser)

router.post('/deleteuser/:userId', userController.postDeleteUser)

module.exports = router