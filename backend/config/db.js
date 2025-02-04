const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/votreDB')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

};

module.exports = connectDB;
