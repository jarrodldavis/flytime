const mock = require('mock-require');
const redis = require('redis-mock');

redis.RedisClient.prototype.unref = function() {};

mock('redis', 'redis-mock');
