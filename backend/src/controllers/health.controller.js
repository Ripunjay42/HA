import { getHealthStatus } from '../services/health.service.js';

export const getHealth = (req, res) => {
  res.status(200).json(getHealthStatus());
};
