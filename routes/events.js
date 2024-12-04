const express = require('express');
const router = express.Router();
const Event = require('../models/play'); // Correctly import the Event model
const authenticateToken = require('../routes/protected');
const User = require('../models/User')

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

//get_events based on location .

router.get('/nearbyevents', authenticateToken, async (req, res) => {
    try {
        const location = req.user.location;  // User's location stored as a string
        // console.log(location)
        if (!location) {
            return res.status(400).json({ message: 'User location is not provided' });
        }

        // Find events with location that matches the user's location string
        const events = await Event.find({ location: { $regex: new RegExp(location, 'i') } });

        res.status(200).json(events);
    } catch (err) {
        res.status(500).json({ Message: 'Server Error', error: err.message });
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

//         // Add the user to the participants array
//         event.participants.push(req.user.id);

//         // Update the event count
//         event.count -= count;

//         // Save the updated event
//         await event.save();

//         // Add the event ID to the user's joinedEvents array
//         const user = await User.findById(req.user.id);
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         // Add the event ID to the user's joinedEvents
//         user.joinedEvents.push({ eventId: event._id });

//         // Save the updated user
//         await user.save();

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

//join_event_2
router.post('/joinevent', authenticateToken, async (req, res) => {
    const { name, count } = req.body; // User provides event name and count to join

    try {
        // Validate count input
        if (!count || count <= 0 || !Number.isInteger(count)) {
            return res.status(400).json({ 
                message: 'Invalid count. Please provide a positive integer.' 
            });
        }

        // Find the event by name and populate participants to get current state
        const event = await Event.findOne({ eventname: name }).populate('participants');
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Validate remaining spots
        if (count > event.count) {
            return res.status(400).json({ 
                message: `Insufficient spots available. Only ${event.count} spot(s) left.`,
                availableSpots: event.count
            });
        }

        // Ensure participants is an array
        event.participants = event.participants || [];

        // Check if the user is already a participant
        const isAlreadyParticipant = event.participants.some(
            user => user._id.toString() === req.user.id.toString()
        );

        if (isAlreadyParticipant) {
            return res.status(400).json({ 
                message: 'You have already joined this event',
                currentParticipation: event.participants.filter(
                    user => user._id.toString() === req.user.id.toString()
                ).length
            });
        }

        // Validate total participants after joining
        const totalParticipantsAfterJoining = event.participants.length + 1;
        const totalSpotsRequired = count;

        if (totalSpotsRequired > event.count) {
            return res.status(400).json({
                message: 'Not enough spots available',
                availableSpots: event.count,
                requestedSpots: totalSpotsRequired
            });
        }

        // Add the user to the participants array
        event.participants.push(req.user.id);

        // Update the event count
        event.count -= totalSpotsRequired;

        // Save the updated event
        await event.save();

        // Find and update the user
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add the event ID to the user's joinedEvents
        user.joinedEvents.push({ 
            eventId: event._id,
            spotsReserved: totalSpotsRequired 
        });

        // Save the updated user
        await user.save();

        res.status(200).json({ 
            message: 'Successfully joined the event', 
            event: {
                eventname: event.eventname,
                location: event.location,
                time: event.time,
                remainingSpots: event.count,
                totalParticipants: event.participants.length,
                spotsReserved: totalSpotsRequired
            } 
        });

    } catch (err) {
        console.error('Error in joining event:', err);
        res.status(500).json({ 
            message: 'Error joining event', 
            error: err.message 
        });
    }
});
// Get the list of events the user has joined
router.get('/joinedevents', authenticateToken, async (req, res) => {
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

// Public sharing endpoint
router.get('/public/share/:eventId', async (req, res) => {
    const { eventId } = req.params;
    try {
        // Find the event by ID
        const event = await Event.findById(eventId);
        
        // Check if the event exists
        if (!event) {
            return res.status(404).json({ message: "Event Not Found" });
        }

        // Prepare the shareable event object with relevant details
        const shareableEvent = {
            eventId: event._id,
            eventname: event.eventname,
            location: event.location,
            time: event.time,
            remainingSpots: event.count
        };

        // Generate the public URL for the event page (frontend URL)
        const publicUrl = `http://localhost:5173/events/${eventId}`; // This will be the URL to share

        // Return the public URL along with event details
        res.status(200).json({
            message: 'Event share details',
            event: shareableEvent,
            publicUrl: publicUrl // Send back the public URL
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Error generating shareable link', 
            error: err.message 
        });
    }
});

// Original event details endpoint
router.get('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(event);
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
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