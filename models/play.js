const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventname: { type: String, required: true },
    location: { type: String, required: true },
    count: { type: Number, required: true },
    time: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Correct reference
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }] // Correct reference
});

module.exports = mongoose.model('Event', EventSchema);
        