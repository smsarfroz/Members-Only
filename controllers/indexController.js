import asyncHandler from "express-async-handler";
import db from "../db/queries.js";
import { body, query, validationResult }  from "express-validator";
import bcrypt from "bcryptjs";

const validatenewUser = [
    body('firstname')
        .trim()
        .isLength({ min: 2, max: 10})
        .withMessage('firstname must have length between 2-10 characters')
        .matches(/^[A-Za-z]+$/)
        .withMessage('first name must consist only of alphabets.'),
    body('lastname')
        .trim()
        .isLength({ min: 2, max: 10})
        .withMessage('lastname must have length between 2-10 characters')
        .matches(/^[A-Za-z]+$/)
        .withMessage('lastname must consist only of alphabets.'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('email must be of proper format - example@xyz.com'),
    body('password')
        .trim()
        .isLength({ min: 5})
        .withMessage('password must be of atleast 5 characters length')
        .matches(/(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/)
        .withMessage('password must contain atleast one letter and one number'),
    body('confirmpassword')
        .notEmpty()
        .withMessage('Confirm Password must not be empty')
        .custom((value, { req }) => {
            return value === req.body.password;
        })
        .withMessage('Please enter the same password')
];

const addnewUser = [validatenewUser, asyncHandler(async(req, res, next) => {
    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {
            return res.status(400).send({ errors: errors.array() });
        }

        const { firstname, lastname, email, password, admin } = req.body;
        console.log(req.body);

        let exists = await db.userexistsbyemail(email);
        if (exists) {
            res.status(400).send('user already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.addnewUser(firstname, lastname, email, hashedPassword, admin);
        console.log('user added to database');
        res.redirect('/');
    } catch (error) {
        console.error(error);
        next(error);
    }
})];

export default {
    addnewUser,
}