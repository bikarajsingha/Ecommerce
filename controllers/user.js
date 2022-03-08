const Product = require('../models/product')
const User = require('../models/user')

exports.getUsers = (req, res, next) => {
    User.findAll()
    .then(users => {
        res.json(users)
    })
    .catch(err => console.log(err))
}

exports.postAddUser = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    User.create({
        name: name,
        email: email
    })
    .then(user => {
        console.log('USER CREATED')
        res.json(user)
    })
    .catch(err => console.log(err))
}

exports.postDeleteUser = (req, res, next) => {
    const usId = req.params.userId
    User.findByPk(usId)
    .then(user => {
        return user.destroy()
    })
    .then(_ => {
        console.log('USER DESTROYED')
        res.redirect('http://localhost:5500/Problems/localStorage.html')
    })
    .catch(err => console.log(err))
}