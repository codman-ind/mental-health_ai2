const mongoose = require('mongoose');

function connecttoDB(){
    mongoose.connect(process.env.MONGO_URI).then(()=>{
        console.log('connected to db');

    })
}


module.exports = connecttoDB;