import mongoose  from 'mongoose'

const db_connect = async () => {
    try{
        mongoose.connect(process.env.MANGO_URI);
        console.log("DataBase is connected succesfully");
    } catch (error) {
        console.log(error);
    }
}

export default db_connect;