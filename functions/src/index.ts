import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
import { gameRoutes } from './routes/gameRoutes';
import { roomRoutes } from './routes/roomRoutes';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());

// API Routes
app.use('/api/game', gameRoutes);
app.use('/api/room', roomRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message,
    timestamp: new Date().toISOString()
  });
});

// Export the Express app as a Firebase Cloud Function
export const api = functions.region('asia-east1').https.onRequest(app);

// Export individual functions for specific triggers
export { onRoomUpdate } from './triggers/roomTriggers';
export { onGameStateChange } from './triggers/gameTriggers';