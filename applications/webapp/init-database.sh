#!/bin/bash

echo "🗄️  Initializing Database"
echo "========================"

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Starting MongoDB..."
    sudo systemctl start mongod
    sleep 3
fi

echo "📊 Creating database and collections..."

# Connect to MongoDB and create initial data
mongosh webapp << 'MONGOEOF'
// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.users.createIndex({ "isActive": 1 })

db.tasks.createIndex({ "userId": 1 })
db.tasks.createIndex({ "status": 1 })
db.tasks.createIndex({ "priority": 1 })
db.tasks.createIndex({ "createdAt": -1 })

// Create a demo admin user
// Password: admin123 (hashed)
db.users.insertOne({
  username: "admin",
  email: "admin@localhost.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewbXKGEOhf8kCrzu",
  role: "admin",
  isActive: true,
  createdAt: new Date()
});

// Create a demo user
// Password: user123 (hashed)
db.users.insertOne({
  username: "testuser",
  email: "user@localhost.com", 
  password: "$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
  role: "user",
  isActive: true,
  createdAt: new Date()
});

print("✅ Database initialized successfully!");
print("📝 Demo users created:");
print("   Admin: admin@localhost.com / admin123");
print("   User:  user@localhost.com / user123");
MONGOEOF

echo ""
echo "✅ Database initialization completed!"
echo "📝 You can now login with:"
echo "   Email: admin@localhost.com"
echo "   Password: admin123"
echo ""
echo "   OR"
echo ""
echo "   Email: user@localhost.com" 
echo "   Password: user123"
echo ""
