const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require("passport");
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');

require('dotenv').config();

passport.use(User.createStrategy());

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback",
  scope: ["profile", "email"]
}, async function(accessToken, refreshToken, profile, done) {
  console.log("Google OAuth Profile:", profile); 
  const { id, displayName, photos, emails } = profile;
  const profilePicture = photos && photos.length > 0 ? photos[0].value : null;
  const email = emails && emails.length > 0 ? emails[0].value : null;

  try {
    let user = await User.findOne({ userId: id });
    if (user) {
      // User exists, update only if profilePicture is not set
      if (!user.profilePicture) {
        user.profilePicture = profilePicture;
      }
      user.username = displayName;
      user.email = email;
      await user.save();
    } else {
      // User does not exist, create a new user
      user = new User({
        userId: id,
        username: displayName,
        profilePicture,
        email
      });
      await user.save();
    }

    const token = jwt.sign({ _id: user._id }, process.env.accessToken_secret, { expiresIn: "1h" });
    return done(null, user, token);
  } catch (err) {
    return done(err); // Handle error
  }
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findById(id);
    console.log("deserializeUser: ", user);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;