import passport from "passport";
import passportLocal from "passport-local";
import UserModel from "./../../models/userModel"
import ChatGroupModel from "./../../models/chatGroupModel";
import {transErrors, transSuccess} from "./../../lang/vi";
let LocalStrategy = passportLocal.Strategy;

//valid user account

let initPassportLocal = () => {
  passport.use(new LocalStrategy({
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true
  }, async (req, email, password, done) => {
    try {
      let user = await UserModel.findByEmail(email);
      if (!user){
        return done(null,false, req.flash("errors",transErrors.login_failed)); // user Không tồn tại
      }

      let checkPassword = await user.comparePassword(password);
      if (!checkPassword){ // kiem tra mk co khop hay khong
        return done(null,false, req.flash("errors",transErrors.login_failed));// loi
      }
      return done(null, user, req.flash("success", transSuccess.loginSuccess(user.username)));//thanh cong
    } catch (e) {
      console.log(e);
      return done(null, false, req.flash("errors"), transErrors.server_error);
    }
  }));
  // save user_id in session
  passport.serializeUser( (user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser( async(id, done) => {
    try{
      let user = await UserModel.findUserByIdForSessionToUse(id);
      let getChatGroupIds = await ChatGroupModel.getChatGroupIdsByUser(user._id);

      user = user.toObject();
      user.chatGroupIds = getChatGroupIds;
      
      return done(null,user);
    }catch(error){
      return done(error, null);
    }
  });

};

module.exports = initPassportLocal;
