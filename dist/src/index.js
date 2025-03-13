"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const test_1 = __importDefault(require("../services/test"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 8080;
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    (0, test_1.default)();
    console.log(`Server is running on http://localhost:${PORT}`);
});
