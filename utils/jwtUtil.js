import { pbkdf2Sync, randomBytes } from 'crypto'
import _jsonwebtoken from "jsonwebtoken"
const {sign, verify} = _jsonwebtoken;
import { readFileSync } from 'fs'
import { join } from 'path'
import bcrypt from "bcryptjs";
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const pathToPrivKey = join(__dirname, 'id_rsa_priv.pem')
const pathToPubKey = join(__dirname, 'id_rsa_pub.pem')
const PRIV_KEY = readFileSync(pathToPrivKey, 'utf-8')
const PUB_KEY = readFileSync(pathToPubKey, 'utf-8')


/**
 * 
 * @param {*} password - the plain text password 
 * @param {*} hash - the hash stored in the database
 * @returns true if hash provided is correct
 * 
 * This function uses crypto library to decrypt the hash using the salt and then
 * compares the decrypted hash/salt with the password that the user provided at login
 */
function validatePassword(password, hash) {
    const isPasswordCorrect = bcrypt.compareSync(password, hash);
    return isPasswordCorrect;
}


/**
 * 
 * @param {*} password - the password string that the suere inputs to the password field in the register form
 * 
 * This function takes a plain text passsword and creates a salt and hash out of it. 
 * Instead of storing the plaintext password in the databse, the salt and hash are stored for security
 * 
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password
 * You would then store the hasshed password in the database and then re-hash it to veryfy later (similar to what we do here) 
 * @returns js object with generated salt and hash
 */
function generatePassword(password) {
    const hashedPassword = bcrypt.hashSync(password);
    return hashedPassword;
}

/**
 * 
 * @param {*} user - The user object. We need this to set the JWT `sub` payload property to the MongoDB user ID
 * @returns js object with token and expires in fields
 */
function issueJWT(user) {
    const _id = user._id;

    const expiresIn = '1d';

    const payload = {
        sub: _id,
        iat: Date.now()
    };

    const signedToken = sign(payload, PRIV_KEY, { expiresIn: expiresIn, algorithm: 'RS256' })

    return {
        token: "Bearer " + signedToken,
        expiresIn: expiresIn
    }
}

function authMiddleware(req, res, next) {
    try { 
        const tokenParts = req.headers.authorization.split(' ');
        // console.log(tokenParts)
    if (tokenParts[0] === "Bearer" && tokenParts[1].match(/\S+\.\S+\.\S+/) !== null) {
        try {
            const verification = verify(tokenParts[1], PUB_KEY, {
                algorithms: ['RS256']
            })
            console.log('verification is ', verification)
            req.jwt = verification;
            next();
        } catch (error) {
            console.log('error occured', error.message)
            return res.status(401).json({ success: false, msg: "you are not authorized to visit this route" });
        }
        } else{
            return res.status(401).json({ success: false, msg: "you are not authorized to visit this route" });
        }
    } 
    catch (error) {
        console.log('error occured', error.message)
        return res.status(401).json({ success: false, msg: "you are not authorized to visit this route" });
    }
}

const _validatePassword = validatePassword
export { _validatePassword as validatePassword }
const _genPassword = generatePassword
export { _genPassword as genPassword }
const _isssueJWT = issueJWT
export { _isssueJWT as issueJWT }
const _authMiddleware = authMiddleware
export { _authMiddleware as authMiddleware }