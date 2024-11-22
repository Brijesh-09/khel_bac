const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    joinedEvents: [
        {
            eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
            eventname: { type: String },
            location: { type: String },
            count: { type: Number },
            time: { type: Date },
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);
