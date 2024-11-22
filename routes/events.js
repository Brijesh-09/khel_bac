const express = require('express');
const router = express.Router();
const Event = require('../models/play'); // Correctly import the Event model
const authenticateToken = require('../routes/protected');

router.get('/events', authenticateToken , async (req, res) => { //get events created by user .
    try {
        const userId = req.user.id;
        const events = await Event.find({userId}); 
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server ERROR', error: err.message });
    }
});

router.get('/getallevents', async (req, res) => {
    try {
        const events = await Event.find(); // Fetch all events
        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ message: 'Server ERROR', error: err.message });
    }
});

//join_event
// router.post('/joinevent', authenticateToken, async (req, res) => {
//     const { name, count } = req.body; // User provides event name and count to join

//     try {
//         // Validate count
//         if (!count || count <= 0) {
//             return res.status(400).json({ message: 'Invalid count provided' });
//         }

//         // Find the event by name
//         const event = await Event.findOne({ eventname: name }).populate('participants');
        
//         if (!event) {
//             return res.status(404).json({ message: 'Event not found' });
//         }

//         // Check if the event has enough spots available
//         if (count > event.count) {
//             return res.status(400).json({ message: `Insufficient spots available. Only ${event.count} spots left.` });
//         }

//         // Ensure participants is an array
//         if (!Array.isArray(event.participants)) {
//             event.participants = [];
//         }

//         // Check if the user is already a participant
//         if (event.participants.some(user => user._id.toString() === req.user.id.toString())) {
//             return res.status(400).json({ message: 'You have already joined this event' });
//         }

//         // Add the user to participants and decrement the event's count
//         event.participants.push(req.user.id);
//         event.count -= count; // Decrease the available spots based on the user's request

//         // Save the updated event
//         await event.save();
//         res.status(200).json({ 
//             message: 'Successfully joined the event', 
//             event: {
//                 eventname: event.eventname,
//                 location: event.location,
//                 time: event.time,
//                 count: event.count, // Remaining spots
//                 participants: event.participants
//             } 
//         });
//     } catch (err) {
//         res.status(500).json({ message: 'Error joining event', error: err.message });
//     }
// });


// Add a new event

//join event #2 
router.post('/joinevent', authenticateToken, async (req, res) => {
    const { eventname, count: userCount } = req.body;

    try {
        // Find the event by name
        const event = await Event.findOne({ eventname });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if the count entered by the user is valid
        if (userCount > event.count || userCount <= 0) {
            return res.status(400).json({ message: 'Invalid count. Please check the event capacity.' });
        }

        // Check if the user has already joined the event
        if (event.participants.includes(req.user.id)) {
            return res.status(400).json({ message: 'You have already joined this event.' });
        }

        // Add the user to the event's participants
        event.participants.push(req.user.id);
        await event.save();

        // Add the event details to the user's joinedEvents
        const user = await User.findById(req.user.id);
        const eventDetails = {
            eventId: event._id,
            eventname: event.eventname,
            location: event.location,
            count: userCount,
            time: event.time,
        };

        user.joinedEvents.push(eventDetails);
        await user.save();

        res.status(200).json({ message: 'Successfully joined the event', eventDetails });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error joining event', error: err.message });
    }
});
// Get the list of events the user has joined
router.get('/user/joinedevents', authenticateToken, async (req, res) => {
    try {
        // Find the user by the user ID from the token
        const user = await User.findById(req.user.id).populate('joinedEvents.eventId');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's joined events
        res.status(200).json({
            message: 'List of joined events',
            events: user.joinedEvents,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching joined events', error: err.message });
    }
});



router.post('/addevent', authenticateToken, async (req, res) => {
    try {
        const { eventname, location, count, time } = req.body;
        // console.log(req.user);
        // Use the user ID from the token to associate the event with the user
        const newEvent = new Event({
            eventname,
            location,
            count,
            time,
            userId: req.user.id,  // Attach user ID from the token
        });

        const savedEvent = await newEvent.save();
        res.status(201).json(savedEvent);
    } catch (err) {
        res.status(500).json({ message: 'Error saving event', error: err.message });
    }
});


// Update an event
router.put('/updateevent/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { eventname, location, count, time } = req.body;

    try {
        // Find the event by ID and ensure it belongs to the current user
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to update this event' });
        }

        event.eventname = eventname;
        event.location = location;
        event.count = count;
        event.time = time;

        const updatedEvent = await event.save();
        res.status(200).json(updatedEvent);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});


// Delete an event
router.delete('/removeevent/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Find the event by ID and ensure it belongs to the current user
        const event = await Event.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: 'You are not authorized to delete this event' });
        }

        await event.remove();
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
});

module.exports = router;