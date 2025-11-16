import express from "express";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createServer } from "../server/_core/index.js";

const app = express();

// Create and configure the server
const server = createServer(app);

// Export for Vercel
export default (req: VercelRequest, res: VercelResponse) => {
  return server(req, res);
};
