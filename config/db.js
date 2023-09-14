const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    let gfs;
    conn.connection.once("open",()=>{
      gfs = new mongoose.mongo.GridFSBucket(conn.connection.db,{
        bucketName:'uploads/'
      })
    })
    
    console.log(`MongoDB connected : ${conn.connection.host}`.cyan.underline);

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;