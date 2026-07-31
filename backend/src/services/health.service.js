import mongoose from 'mongoose';

export const getHealthStatus = () => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    db: dbStates[mongoose.connection.readyState],
  };
};
