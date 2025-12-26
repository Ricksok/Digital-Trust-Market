import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any; // Temporary workaround until Prisma client is regenerated

/**
 * Record a time-series event
 */
export const recordEvent = async (data: {
  eventType: string;
  entityId?: string;
  entityType?: string;
  eventData: any;
  value?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  source?: string;
  metadata?: any;
}) => {
  const event = await prisma.timeSeriesEvent.create({
    data: {
      eventType: data.eventType,
      entityId: data.entityId,
      entityType: data.entityType,
      eventData: JSON.stringify(data.eventData),
      value: data.value,
      currency: data.currency,
      category: data.category,
      tags: data.tags ? JSON.stringify(data.tags) : null,
      source: data.source,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      timestamp: new Date(),
    },
  });

  return event;
};

/**
 * Get events with filters
 */
export const getEvents = async (query: any) => {
  const {
    page = 1,
    limit = 100,
    eventType,
    entityId,
    entityType,
    category,
    startDate,
    endDate,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};

  if (eventType) where.eventType = eventType;
  if (entityId) where.entityId = entityId;
  if (entityType) where.entityType = entityType;
  if (category) where.category = category;
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }

  const [events, total] = await Promise.all([
    prisma.timeSeriesEvent.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { timestamp: 'desc' },
    }),
    prisma.timeSeriesEvent.count({ where }),
  ]);

  return {
    events: events.map((e: any) => ({
      ...e,
      eventData: JSON.parse(e.eventData),
      tags: e.tags ? JSON.parse(e.tags) : null,
      metadata: e.metadata ? JSON.parse(e.metadata) : null,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

/**
 * Get aggregated metrics by time period
 */
export const getAggregatedMetrics = async (query: {
  eventType: string;
  entityType?: string;
  entityId?: string;
  startDate: string;
  endDate: string;
  groupBy: 'hour' | 'day' | 'week' | 'month';
  aggregation: 'sum' | 'avg' | 'count' | 'min' | 'max';
}) => {
  // For SQLite, we'll use Prisma's groupBy with date truncation
  // This is a simplified version - for production, consider using raw SQL or a time-series DB
  const events = await prisma.timeSeriesEvent.findMany({
    where: {
      eventType: query.eventType,
      entityType: query.entityType,
      entityId: query.entityId,
      timestamp: {
        gte: new Date(query.startDate),
        lte: new Date(query.endDate),
      },
    },
    orderBy: { timestamp: 'asc' },
  });

  // Group events by time period
  const grouped: Record<string, number[]> = {};

  events.forEach((event: any) => {
    const date = new Date(event.timestamp);
    let key: string;

    switch (query.groupBy) {
      case 'hour':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:00:00`;
        break;
      case 'day':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = `${weekStart.getFullYear()}-W${String(Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000))).padStart(2, '0')}`;
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = date.toISOString();
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }

    if (event.value !== null) {
      grouped[key].push(event.value);
    } else {
      grouped[key].push(1); // Count if no value
    }
  });

  // Apply aggregation
  const result = Object.entries(grouped).map(([period, values]) => {
    let aggregated: number;

    switch (query.aggregation) {
      case 'sum':
        aggregated = values.reduce((sum, v) => sum + v, 0);
        break;
      case 'avg':
        aggregated = values.reduce((sum, v) => sum + v, 0) / values.length;
        break;
      case 'count':
        aggregated = values.length;
        break;
      case 'min':
        aggregated = Math.min(...values);
        break;
      case 'max':
        aggregated = Math.max(...values);
        break;
      default:
        aggregated = values.length;
    }

    return {
      period,
      value: aggregated,
      count: values.length,
    };
  });

  return result.sort((a, b) => a.period.localeCompare(b.period));
};

/**
 * Create analytics snapshot
 */
export const createSnapshot = async (data: {
  snapshotType: string;
  entityId?: string;
  entityType?: string;
  metrics: any;
  dimensions?: any;
  periodStart: Date;
  periodEnd: Date;
  calculationVersion?: string;
}) => {
  const snapshot = await prisma.analyticsSnapshot.create({
    data: {
      snapshotType: data.snapshotType,
      entityId: data.entityId,
      entityType: data.entityType,
      metrics: JSON.stringify(data.metrics),
      dimensions: data.dimensions ? JSON.stringify(data.dimensions) : null,
      periodStart: data.periodStart,
      periodEnd: data.periodEnd,
      calculationVersion: data.calculationVersion,
    },
  });

  return snapshot;
};

/**
 * Get snapshots
 */
export const getSnapshots = async (query: any) => {
  const {
    page = 1,
    limit = 10,
    snapshotType,
    entityId,
    entityType,
    startDate,
    endDate,
  } = query;

  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};

  if (snapshotType) where.snapshotType = snapshotType;
  if (entityId) where.entityId = entityId;
  if (entityType) where.entityType = entityType;
  if (startDate || endDate) {
    where.periodStart = {};
    if (startDate) where.periodStart.gte = new Date(startDate);
    if (endDate) where.periodEnd.lte = new Date(endDate);
  }

  const [snapshots, total] = await Promise.all([
    prisma.analyticsSnapshot.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { periodStart: 'desc' },
    }),
    prisma.analyticsSnapshot.count({ where }),
  ]);

  return {
    snapshots: snapshots.map((s: any) => ({
      ...s,
      metrics: JSON.parse(s.metrics),
      dimensions: s.dimensions ? JSON.parse(s.dimensions) : null,
    })),
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  };
};

