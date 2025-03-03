const { createHash } = require( 'node:crypto' );

module.exports = function() {
	const hash = createHash( 'md5' );
	const now  = new Date().toISOString();
	hash.update( now );
	const nonce = hash.copy().digest( 'hex' );
	return { 'fullNonce': nonce, 'shortNonce': nonce.substring( 0, 12 ) };
}