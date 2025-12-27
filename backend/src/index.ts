import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import kycRoutes from './routes/kyc.routes';
import projectRoutes from './routes/project.routes';
import investmentRoutes from './routes/investment.routes';
import paymentRoutes from './routes/payment.routes';
import escrowRoutes from './routes/escrow.routes';
import analyticsRoutes from './routes/analytics.routes';
import complianceRoutes from './routes/compliance.routes';
import demoRoutes from './routes/demo.routes';
import trustRoutes from './routes/trust.routes';
import auctionRoutes from './routes/auction.routes';
import guaranteeRoutes from './routes/guarantee.routes';
import tokenRoutes from './routes/token.routes';
import governanceRoutes from './routes/governance.routes';
import stakingRoutes from './routes/staking.routes';
import rewardRoutes from './routes/reward.routes';
import regulatoryReportingRoutes from './routes/regulatory-reporting.routes';
import investorReportingRoutes from './routes/investor-reporting.routes';
import onboardingRoutes from './routes/onboarding.routes';
import learningRoutes from './routes/learning.routes';
import vendorCentralRoutes from './routes/vendor-central.routes';
import cartRoutes from './routes/cart.routes';
import checkoutRoutes from './routes/checkout.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In development, allow any localhost origin
      if (process.env.NODE_ENV !== 'production' && origin?.startsWith('http://localhost:')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/escrow', escrowRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/demo', demoRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/guarantees', guaranteeRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/staking', stakingRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/regulatory-reporting', regulatoryReportingRoutes);
app.use('/api/investor-reporting', investorReportingRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/vendor-central', vendorCentralRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;


