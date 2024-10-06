const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');



const pass = "sumit";
const dbPass = "sumit";

const getHashPassword = async (password) => {
    let saltRounds = 10;
    let hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
};


const comparePasswords = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};


async function testhash() {
    console.log("user pass",pass);
    const hashPassword = "$2a$10$uw100nbqzivXwISgs3hCy.g5WztNucek/ymnigPGRhVymY4nqJYGy";
    console.log("hashPassword - ", hashPassword);
    const isPasswordMatched = await comparePasswords(dbPass, hashPassword);
    console.log("isPasswordMatched ->",isPasswordMatched)
}


testhash();