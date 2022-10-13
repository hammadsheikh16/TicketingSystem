const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asynchandler = require('express-async-handler')
const User = require('../models/userModel')

// @desc Register new user
// @route POST /api/users
// @access Public
const registerUser = asynchandler(async (req, res) => {
  const { name, email, password } = req.body

  if (!(name && email && password)){
    res.status(400)
    throw new Error('Please enter all fields')
  }

  // Existence of user
  const userExists = await User.findOne({email})

  if (userExists){
    res.status(400)
    throw new Error('User already exists')
  }

  const salt = await bcrypt.genSalt(10)
  const hashedPass = await bcrypt.hash(password, salt)


  // Create user with user model
  const user = await User.create({
    name, email, password: hashedPass
  })

  if (user){
    res.status(201).json({
      token: jst.sign({}, { _id: user._id, name: user.name, email: user.email }, { expiresIn: '1d'}),
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    })
  }else{
    res.status(400)
    throw new Error('Invalid user data')
  }


})

// @desc Authenticate a user
// @route POST /api/users/login
// @access Public
const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body

  // Fetch an entry with email in body
  const user = await User.findOne({email})

  if (user && await bcrypt.compare(password, user.password)){
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: token(user._id),
      })
  }else{
    res.status(400)
    throw new Error('Invalid credentials')
  }

  res.json({message: 'Login user'})
})

// @desc Get user data
// @route GET /api/users/me
// @access Public
const getMe = asynchandler(async (req, res) => {
  res.json({message: 'User data display'})
})


// Generate token
const token = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })
}

module.exports = {
  registerUser,
  loginUser,
  getMe,
}