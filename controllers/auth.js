/* eslint-disable import/extensions */
import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';

/**
 * @description login route
 * @access Public
 * @route POST api/users/login
 * @param  {email,password}
 * @returns {_id,phone,email,name,isAdmin,isVerified,token}
 * @
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        isVerified: user.isVerified,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).send({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).send({ message: `Something went wrong ${error}` });
  }
};

/**
 * @description egsiter new user
 * @access Public
 * @route POST api/users/register
 * @param  {email,name,password,phone}
 * @returns {_id,phone,email,name,isAdmin,isVerified,token}
 * @
 */
const registerUser = async (req, res) => {
  // console.log("hi");
  const { email, name, password, phone, isAdmin } = req.body;
  const userExists = await User.findOne({
    $or: [{ email: email }, ],
  });
  if (userExists) {
    res.status(400).send({ message: 'Email already exists' });
  }
  // console.log(req.body);
  const user = await User.create({
    email: email,
    name: name,
    password: password,
  });

  if (isAdmin){
    user.isAdmin = true;
    user.save();
  }
  if (user) {
    res.status(201).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).send({ message: 'Invalid user data' });
  }
};

// logout
const logout = (req, res) => {
  res.clearCookie('token');
  res.send('User logout Route');
  res.json({
    message: 'User logout Successfully',
  });
};

export { login, registerUser, logout };
