import User from '../models/User'
import jwt from 'jsonwebtoken'
import Config from '../service/config'
import Role from '../models/Role'
import bcrypt from 'bcrypt'

export const signUp = async (req, res) => {
    
    
    const {username, email, password, roles} = req.body
    console.log({username, email, password:bcrypt.hashSync(password, bcrypt.genSaltSync(10))})

    const newUser = new User({
        username,
        email,
        password: bcrypt.hashSync(password, bcrypt.genSaltSync(10))
    })
    if(roles) {
        const foundRoles = await Role.find({name: {$in: roles}})
        newUser.roles = foundRoles.map(role => role._id)
    } else {
        const role = await Role.findOne({name: 'user'})
        newUser.roles = [role._id]
    }
    const savedUser = await newUser.save()

    const token = jwt.sign({id: savedUser._id}, Config.TOKEN_SECRET_KEY, {expiresIn: 86400})
    res.status(200).json({token})
}
export const signIn = async (req,res) => {
    const userFound = await User.findOne({email: req.body.email}).populate("roles")
    if(!userFound) return res.status(400).json({msg: 'noencontrado'})
    console.log(userFound);
    const matchPassword = bcrypt.compareSync(req.body.password, userFound.password);
    // const matchPass = await User.comparePassword(req.body.password, userFound.password)

    if(!matchPassword) return res.status(401).json({token: null, msg: 'invalid password'})
    const token = jwt.sign({id: userFound._id}, Config.TOKEN_SECRET_KEY, {expiresIn: 86400})
    res.json({token})

}