// Export all models from this directory
const User = require('./User');

module.exports = {
    User
};

/*
Available models:
- User: Authentication model for both customers and scientists

Future models to be implemented:
- Report model (generated reports)
- Analytics model (transportation data)
- Settings model (user preferences)
- TripLog model (customer trip data)
- Notification model (system notifications)
*/
