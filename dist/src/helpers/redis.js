"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCache = exports.getCache = void 0;
const redis = require("redis");
require('dotenv').config();
const client = redis.createClient({ url: process.env.REDISCLOUD_URL });
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        client.on('error', (err) => console.log('Redis Client Error', err));
        yield client.connect();
    });
})();
const getCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const reply = yield client.get(key);
    return JSON.parse(reply);
});
exports.getCache = getCache;
const setCache = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield client.set(key, JSON.stringify(data), {
        EX: 60
    });
});
exports.setCache = setCache;
