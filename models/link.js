var mongoose = require('mongoose');

var Link = mongoose.model(
    'Link',
    {
        url: {
            type: String,
            required: true,
            minlength: 8,
            trim: true
        },
        short: {
            type: String,
            required: true,
            trim: true
        }
    }
);

module.exports = { Link };