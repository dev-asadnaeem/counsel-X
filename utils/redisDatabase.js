const { createClient } = require("redis");

// Simple in-memory fallback so the app can still run without Redis.
const mockStore = new Map();

const mockClient = {
  async get(key) {
    const record = mockStore.get(key);
    if (!record) return null;
    if (record.expiresAt && record.expiresAt <= Date.now()) {
      mockStore.delete(key);
      return null;
    }
    return record.value;
  },
  async set(key, value, options = {}) {
    const ttlMs = options.EX ? options.EX * 1000 : undefined;
    const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
    mockStore.set(key, { value, expiresAt });
    return "OK";
  },
  async del(key) {
    mockStore.delete(key);
    return 1;
  },
};

let activeClient = mockClient;

const redisUrl = process.env.REDIS_STRING;

if (redisUrl) {
  const redisClient = createClient({ url: redisUrl });

  redisClient.on("error", (err) => {
    console.warn("Redis error, falling back to mock:", err.message);
    activeClient = mockClient;
  });

  redisClient
    .connect()
    .then(() => {
      console.log("✅ Redis connected");
      activeClient = redisClient;
    })
    .catch((err) => {
      console.warn("Redis connect failed, using mock:", err.message);
      activeClient = mockClient;
    });
}

// Wrap calls so downstream code does not care which client is active.
module.exports = {
  async get(key) {
    return activeClient.get(key);
  },
  async set(key, value, option, expiry) {
    // Normalize legacy signatures: set(key, value, "EX", ttl) or set(key, value, { EX: ttl })
    if (option === "EX" && typeof expiry === "number") {
      return activeClient.set(key, value, { EX: expiry });
    }
    if (option && typeof option === "object") {
      return activeClient.set(key, value, option);
    }
    return activeClient.set(key, value);
  },
  async del(key) {
    return activeClient.del(key);
  },
};