const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/counselling-app").then(async () => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("COLLECTIONS:");
    collections.forEach(col => console.log(col.name));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
});
