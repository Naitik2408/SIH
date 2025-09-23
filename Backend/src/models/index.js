// Export all models from this directory
const User = require('./User');
const Post = require('./Post');
const Journey = require('./Journey');

module.exports = {
    User,
    Post,
    Journey
};

/*
Available models:
- User: Authentication model for both customers and scientists
- Post: Community posts model for sharing travel experiences and updates

Future models to be implemented:
- Report model (generated reports)
- Analytics model (transportation data)
- Settings model (user preferences)
- TripLog model (customer trip data)
- Notification model (system notifications)
*/
