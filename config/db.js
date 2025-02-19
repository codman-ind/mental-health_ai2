const mongoose = require('mongoose');

function connecttoDB() {
    mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
}

module.exports = connecttoDB;
