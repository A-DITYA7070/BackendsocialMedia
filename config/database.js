import mongoose from "mongoose";

const connecToDb = () => {
    mongoose.connect(process.env.DB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology :true,
}).then((conn)=>{
      console.log(`connected to db ${conn.connection.host}`);
}).catch((err)=>{
    console.log(err);
});
};

export default connecToDb;