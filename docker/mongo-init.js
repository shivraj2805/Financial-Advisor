// MongoDB initialization script
db = db.getSiblingDB('financial_advisor');

// Create collections
db.createCollection('users');
db.createCollection('transactions');
db.createCollection('meetings');
db.createCollection('messages');
db.createCollection('communities');
db.createCollection('success_stories');
db.createCollection('schemes');
db.createCollection('achievements');
db.createCollection('game_progress');
db.createCollection('multiplayer_games');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.transactions.createIndex({ "userId": 1, "date": -1 });
db.meetings.createIndex({ "date": 1 });
db.messages.createIndex({ "meetingId": 1, "timestamp": 1 });

print('✅ MongoDB initialized successfully!');
