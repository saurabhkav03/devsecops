// Initialize database with sample data and indexes
db = db.getSiblingDB('webapp');

// Create users collection with indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "createdAt": 1 });

// Create tasks collection with indexes
db.tasks.createIndex({ "userId": 1 });
db.tasks.createIndex({ "status": 1 });
db.tasks.createIndex({ "priority": 1 });
db.tasks.createIndex({ "createdAt": -1 });
db.tasks.createIndex({ "dueDate": 1 });
db.tasks.createIndex({ "userId": 1, "status": 1 });
db.tasks.createIndex({ "userId": 1, "priority": 1 });

// Insert sample admin user (password: admin123)
db.users.insertOne({
  username: "admin",
  email: "admin@webapp.local",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbXKGEOhf8kCrzu",
  role: "admin",
  isActive: true,
  createdAt: new Date()
});

print("Database initialization completed successfully!");
print("Admin user created - Email: admin@webapp.local, Password: admin123");

