const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/user');

module.exports = {
  createUser: async args => {
    try {
      const { email, password } = args.userInput;

      const existingUser = await User.findOne({ email });
      if(existingUser) {
        throw new Error('User exists already.');
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = new User({
        email,
        password: hashedPassword
      });

      const result = await user.save();

      return {...result._doc, password: null, _id: result.id }
    } catch (err) {
      throw err;
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({email});

    if(!user) {
      throw new Error('Invalid credentials.');
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throw new Error('Invalid credentials.');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
   );

    return {
      userId: user.id,
      token,
      tokenExpiration: 1
    };
  } 
};