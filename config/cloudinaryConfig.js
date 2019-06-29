// const { config, uploader } =require( 'cloudinary');
const { config } = require( "cloudinary" );
const { uploader } = require( "cloudinary" );
// import dotenv from 'dotenv';
// dotenv.config();
const cloudinaryConfig = ( req, res, next ) => {
    config( {
        cloud_name: "dlzucgqfw",
        api_key: "893174125255488",
        api_secret: "GzS2jDFDRkGbTYJ2i-XPziaME8A",
    } );
    console.log( "here" );
    next();
};

// export { cloudinaryConfig, uploader };
module.exports = { cloudinaryConfig, uploader };
