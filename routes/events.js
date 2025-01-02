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
        if (!location) {
            return res.status(400).json({ message: 'User location is not provided' });
        }

        // Find events with location that matches the user's location string
        const events = await Event.find({ location: { $regex: new RegExp(location, 'i') } });

        // For each event, map the participant IDs to usernames
        const updatedEvents = await Promise.all(events.map(async (event) => {
            const participantsWithUsernames = await Promise.all(event.participants.map(async (userId) => {
                // Fetch the user based on userId (assuming you have a User model to get the username)
                const user = await User.findById(userId);
                return user ? user.username : null;  // Return the username or null if user not found
            }));

            // Create a new event object with participants' usernames instead of user IDs
            return {
                ...event.toObject(), // Convert mongoose document to plain object
                participants: participantsWithUsernames,
            };
        }));
        console.log(updatedEvents);
        res.status(200).json(updatedEvents);
    } catch (err) {
        res.status(500).json({ Message: 'Server Error', error: err.message });
    }
});


//join_event_2
router.post('/joinevent', authenticateToken, async (req, res) => {
    const { name, count } = req.body;

    try {
        // Validate count input
        if (!count || count <= 0 || !Number.isInteger(count)) {
            return res.status(400).json({ 
                message: 'Invalid count. Please provide a positive integer.' 
            });
        }

        // Find the event by name and populate participants
        const event = await Event.findOne({ eventname: name });
        
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Calculate remaining spots
        const remainingSpots = event.count;

// Check if there are enough spots
if (count > remainingSpots) {
    return res.status(400).json({ 
        message: `Insufficient spots available. Only ${remainingSpots} spot(s) left.`,
        availableSpots: remainingSpots
    });
}

        // Check if the user is already a participant
        const isAlreadyParticipant = event.participants.some(
            participantId => participantId.toString() === req.user.id.toString()
        );

        if (isAlreadyParticipant) {
            return res.status(400).json({ 
                message: 'You have already joined this event'
            });
        }

        // Add the user to the participants array
        event.participants.push(req.user.id);

        // Reduce the available spots
        event.count -= count;

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
            spotsReserved: count 
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
                totalSpots: event.totalSpots,
                totalParticipants: event.participants.length,
                spotsReserved: count
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
// router.get('/public/share/:eventId', async (req, res) => {
//     const { eventId } = req.params;
//     try {
//         // Find the event by ID
//         const event = await Event.findById(eventId);
        
//         // Check if the event exists
//         if (!event) {
//             return res.status(404).json({ message: "Event Not Found" });
//         }

//         // Prepare the shareable event object with relevant details
//         const shareableEvent = {
//             eventId: event._id,
//             eventname: event.eventname,
//             location: event.location,
//             time: event.time,
//             remainingSpots: event.count
//         };

//         // Generate the public URL for the event page (frontend URL)
//         const publicUrl = `khel-fron.vercel.app/events/${eventId}`; // This will be the URL to share

//         // Return the public URL along with event details
//         res.status(200).json({
//             message: 'Event share details',
//             event: shareableEvent,
//             publicUrl: publicUrl // Send back the public URL
//         });
//     } catch (err) {
//         res.status(500).json({ 
//             message: 'Error generating shareable link', 
//             error: err.message 
//         });
//     }
// });

// // Original event details endpoint
// router.get('/events/:eventId', async (req, res) => {
//     const { eventId } = req.params;

//     try {
//         const event = await Event.findById(eventId);

//         if (!event) {
//             return res.status(404).json({ message: 'Event not found' });
//         }

//         res.status(200).json(event);
//     } catch (err) {
//         res.status(500).json({ message: 'Server error', error: err.message });
//     }
// });


//share_fix
// Public sharing endpoint
// Public sharing endpoint
router.get('/public/share/:eventId', async (req, res) => {
    const { eventId } = req.params;
    try {
        // Find the event by ID and populate participants (optional)
        const event = await Event.findById(eventId).populate('participants', 'username');
        
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
            remainingSpots: event.count,
            totalSpots: event.totalSpots,
            participantsCount: event.participants.length,
        };

        // Construct a complete public URL for sharing
        const baseUrl = `${req.protocol}://${req.get('host')}`; // Dynamically generate base URL
        const publicUrl = `${baseUrl}/events/${eventId}`;

        // Return the shareable link and event details
        res.status(200).json({
            message: 'Event share details',
            event: shareableEvent,
            publicUrl, // Full URL for sharing
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Error generating shareable link', 
            error: err.message 
        });
    }
});


// Public event details endpoint
router.get('/events/:eventId', async (req, res) => {
    const { eventId } = req.params;

    try {
        // Find event and populate participants with username only
        const event = await Event.findById(eventId).populate('participants', 'username');

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Return formatted event details
        res.json({
            _id: event._id,
            eventname: event.eventname,
            location: event.location,
            count: event.count,
            totalSpots: event.totalSpots,
            time: event.time,
            participants: event.participants.map(p => p.username),
            isFull: event.count === 0
        });
    } catch (err) {
        res.status(500).json({ 
            message: 'Error fetching event details', 
            error: err.message 
        });
    }
});

router.post('/addevent', authenticateToken, async (req, res) => {
    try {
        const { eventname, location, count, time } = req.body;
        
        // Validate input
        if (!count || count <= 0) {
            return res.status(400).json({ 
                message: 'Event must have a valid number of spots' 
            });
        }

        const newEvent = new Event({
            eventname,
            location,
            count, // This will be available spots
            time,
            userId: req.user.id,
            participants: [],
            totalSpots: count // Store the original total
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