// import Datauri from 'datauri';
// import path from 'path';
const path = require( "path" );
const Datauri = require( "datauri" );

const dUri = new Datauri();
const multer = require( "multer" );

const storage = multer.memoryStorage();
const multerUploads = multer( { storage } ).single( "file" );
// module.exports= multerUploads ;

const dataUri = req => dUri.format( path.extname( req.file.originalname ).toString(), req.file.buffer );
// export { multerUploads, dataUri };
module.exports = { multerUploads, dataUri };
