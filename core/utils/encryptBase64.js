/**
 * Encrypt a text in base64
 * @param text
 * @returns {string}
 */
const encryptText = (text) => {
    return Buffer.from(text).toString('base64');
};

/**
 * Descrypt base64 hash and compare with plain text
 * @param text
 * @param hash
 * @returns {boolean}
 */
const compareHash = (text, hash) => {
    return text === Buffer.from(hash, 'base64').toString('utf8');
};


module.exports = {encryptText, compareHash};