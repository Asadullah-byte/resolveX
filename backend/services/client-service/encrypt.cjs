const CryptoJS = require("crypto-js");

const SECRET_KEY = "Str@ydog$2289BUTT"; // Use the same key as in your backend
const fileId = "67e1521db8f351710b6a8fe8"; // Replace with an actual ID from MongoDB

const encryptedId = CryptoJS.AES.encrypt(fileId, SECRET_KEY).toString();
console.log("Encrypted File ID:", encryptedId);
const encodedId = encodeURIComponent(encryptedId);
console.log("Encoded Encrypted File ID:", encodedId);

 const encryptedFileId = decodeURIComponent(encodedId);
    console.log("Decoded Encrypted File ID:", encryptedFileId);

    // Decrypt the file ID
    const bytes = CryptoJS.AES.decrypt(encryptedFileId, SECRET_KEY);
    const decryptedFileId = bytes.toString(CryptoJS.enc.Utf8);

console.log(decryptedFileId);





