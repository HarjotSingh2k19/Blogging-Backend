import User from "../model/User";
import bcrypt from "bcryptjs";
import { genPassword, issueJWT, validatePassword } from "../utils/jwtUtil.js";

export const getAllUser = async(req, res, next) => {
    let users;
    try{
        users = await User.find();
    } catch(err) {
        console.log(err);
    }

    if(!users) {
        return res.status(404).json({message : "No users found"});
    }

    return res.status(200).json({users});
};

export const signup = async (req, res, next) => {
    const {name, email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email }); // filtering only on the basis of email
    } catch(err) {
        return console.log(err);
    }

    if(existingUser){
        return res.status(400).json({message : "User already exist! Login Instead"});
    }

    // new user is there
    const hashedPassword = genPassword(password);

    const user = new User({
        name,
        email,
        password : hashedPassword,
        blogs: [],
    });

    

    try {
        await user.save();
        const issuedJWT = issueJWT(user);
        const responseMessage = {message: "Account created successfully.", token: issuedJWT.token}
        return res.status(201).json(responseMessage);
    } catch(err){
        return console.log(err);
    }    
};

export const login = async(req, res, next) => {
    const { email, password} = req.body;

    let existingUser;
    try {
        existingUser = await User.findOne({ email }); // filtering only on the basis of email
    } catch(err) {
        return console.log(err);
    }

    if(!existingUser){
        return res.status(404).json({message : "Couldn't find user by this Email"});
    }

    const isPasswordCorrect = validatePassword(password, existingUser.password);

    if(!isPasswordCorrect) {
        return res.status(400).json({meassage: "Incorrect password"});
    }

    try {
        const issuedJWT = issueJWT(existingUser);
        const responseMessage = {message: "Logged in successfully.", token: issuedJWT.token}
        return res.status(201).json(responseMessage);
    } catch(err){
        return console.log(err);
    }

    return res.status(200).json({message: "Login Successfull"});

};

