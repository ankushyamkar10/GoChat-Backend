const mongoose = require('mongoose')

const groupSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
    },
    admin: {
        type: Array,
        required: true,
        ref : 'User'
    },
    members: {
        type: Array,
    },
    isAvtarSet: {
        type: Boolean,
        default: false,
    },
    img: {
        type: String,
        required: true,
        default: "https://www.nicepng.com/png/detail/131-1318812_avatar-group-icon.png"
    },
    messages: {
        type: Array,
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Group', groupSchema)