import {check} from "express-validator/check";
import {transValidation} from "./../lang/vi";

let checkMessageLength = [ 
    check("messageVal", "Tin nhắn ít nhất 1 ký tự")
        .isLength({min: 1, max: 400})
];

module.exports = checkMessageLength;
  
