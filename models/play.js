const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    eventname: { type: String, required: true },
    location: { type: String, required: true },
    count: { type: Number, required: true }, // Current available spots
    totalSpots: { type: Number, required: true }, // Original total spots
    time: { type: Date, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
});

module.exports = mongoose.model('Event', EventSchema);
        