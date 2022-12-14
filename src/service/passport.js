import passport from "passport";
import User from '../models/User'
import bcrypt from 'bcrypt'


const LocalStrategy = require('passport-local').Strategy


passport.serializeUser((user,done) => {
    done(null, user.id)
})

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user)
    })
})

passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallBack: true
}, async (req, email, password, done) => {
    const user = await User.findOne({email: email})
    if(user){ 
        return done(null, false, req.flash('signupMessage', 'Email exists.'))
    }else {
        
            const newUser = new User();
            newUser.email = email;
            newUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            await newUser.save();
            done(null, newUser);

    }
}))

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, email, password, done)=>{
    const user = await User.findOne({email: email})
    if(!user){
        return done(null, false, req.flash('signinMessage', 'No user found'))
    }
    if(!user.comparePassword(password)){
        return done(null, false, req.flash('signinMessage', 'Incorrect Password'))

    }
    done(null, user);
} ))