const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo:27017/docker-db')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

};

module.exports = connectDB;
