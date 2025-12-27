/// <reference types="node" />
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed default permissions and roles for RBAC system
 */
async function seedRBAC() {
  console.log('🔐 Seeding RBAC system...');

  // Define all permissions
  const permissions = [
    // ===== Authentication & Profile (Shared Workflow) =====
    { name: 'auth.login', resource: 'auth', action: 'login', description: 'Login to the system' },
    { name: 'auth.refresh', resource: 'auth', action: 'refresh', description: 'Refresh authentication token' },
    { name: 'profile.view.own', resource: 'profile', action: 'view.own', description: 'View own profile' },
    { name: 'profile.update.own', resource: 'profile', action: 'update.own', description: 'Update own profile' },
    { name: 'permissions.view.own', resource: 'permissions', action: 'view.own', description: 'View own permissions' },
    
    // ===== Trade Execution Engine (TEE) =====
    { name: 'tee.listings.view', resource: 'tee', action: 'listings.view', description: 'View marketplace listings' },
    { name: 'tee.trade.create', resource: 'tee', action: 'trade.create', description: 'Create trade orders' },
    { name: 'tee.trade.view.own', resource: 'tee', action: 'trade.view.own', description: 'View own trades' },
    { name: 'tee.contract.view.own', resource: 'tee', action: 'contract.view.own', description: 'View own contracts' },
    { name: 'tee.aggregate.create', resource: 'tee', action: 'aggregate.create', description: 'Create aggregated lots' },
    
    // ===== Reverse Auction Engine (RAE) =====
    { name: 'rae.notice.view', resource: 'rae', action: 'notice.view', description: 'View demand notices' },
    { name: 'rae.notice.create', resource: 'rae', action: 'notice.create', description: 'Create demand notices' },
    { name: 'rae.bid.create', resource: 'rae', action: 'bid.create', description: 'Submit bids' },
    { name: 'rae.bid.view.own', resource: 'rae', action: 'bid.view.own', description: 'View own bids' },
    { name: 'rae.bid.review', resource: 'rae', action: 'bid.review', description: 'Review bids (buyer)' },
    { name: 'rae.award.execute', resource: 'rae', action: 'award.execute', description: 'Award contracts' },
    
    // ===== Guarantee Engine (GE) =====
    { name: 'ge.escrow.view.own', resource: 'ge', action: 'escrow.view.own', description: 'View own escrow' },
    { name: 'ge.escrow.manage', resource: 'ge', action: 'escrow.manage', description: 'Manage escrow (institution-only)' },
    { name: 'ge.sponsor.create', resource: 'ge', action: 'sponsor.create', description: 'Sponsor member guarantees' },
    
    // ===== Co-operative Management =====
    { name: 'coop.members.manage', resource: 'coop', action: 'members.manage', description: 'Manage co-op members' },
    
    // ===== SACCO Management =====
    { name: 'sacco.members.manage', resource: 'sacco', action: 'members.manage', description: 'Manage SACCO members' },
    { name: 'sacco.suitability.approve', resource: 'sacco', action: 'suitability.approve', description: 'Approve member eligibility for securities' },
    
    // ===== Settlement =====
    { name: 'settlement.instructions.view', resource: 'settlement', action: 'instructions.view', description: 'View settlement instructions' },
    
    // ===== Securities Exchange Engine (SEE) =====
    { name: 'see.secondary.trade.continuous.sacco', resource: 'see', action: 'secondary.trade.continuous.sacco', description: 'Continuous secondary trading (SACCO)' },
    { name: 'see.market.halt', resource: 'see', action: 'market.halt', description: 'Halt market trading (SACCO + Platform Risk)' },
    { name: 'see.surveillance.view', resource: 'see', action: 'surveillance.view', description: 'View surveillance alerts (compliance)' },
    { name: 'see.issuance.create', resource: 'see', action: 'issuance.create', description: 'Create private placements' },
    { name: 'see.issuance.publish', resource: 'see', action: 'issuance.publish', description: 'Publish offerings' },
    { name: 'see.issuance.view.own', resource: 'see', action: 'issuance.view.own', description: 'View own issuances' },
    { name: 'see.offerings.view', resource: 'see', action: 'offerings.view', description: 'View available offerings' },
    { name: 'see.invest.subscribe', resource: 'see', action: 'invest.subscribe', description: 'Subscribe to private placements' },
    { name: 'see.portfolio.view.own', resource: 'see', action: 'portfolio.view.own', description: 'View own portfolio' },
    
    // ===== Centralized Digital Settlement Engine (CDSE) =====
    { name: 'cdse.settlement.queue.view', resource: 'cdse', action: 'settlement.queue.view', description: 'View settlement queue' },
    { name: 'cdse.settlement.confirm', resource: 'cdse', action: 'settlement.confirm', description: 'Confirm settlement completion' },
    
    // ===== Regulatory Reporting Engine (RRE) =====
    { name: 'rre.dashboard.view', resource: 'rre', action: 'dashboard.view', description: 'View regulator dashboard' },
    { name: 'rre.reports.download', resource: 'rre', action: 'reports.download', description: 'Download regulatory reports' },
    
    // ===== API Access =====
    { name: 'api.order.submit', resource: 'api', action: 'order.submit', description: 'Submit orders via API' },
    { name: 'api.positions.read', resource: 'api', action: 'positions.read', description: 'Read positions via API' },
    
    // ===== Impact Reporting Engine (IRE) =====
    { name: 'ire.portfolio.read', resource: 'ire', action: 'portfolio.read', description: 'Read portfolio data' },
    { name: 'ire.impact.read', resource: 'ire', action: 'impact.read', description: 'Read impact reports' },
    
    // ===== Legacy Permissions (Projects, Investments, Auctions, Guarantees) =====
    { name: 'projects.create', resource: 'projects', action: 'create', description: 'Create new projects' },
    { name: 'projects.view', resource: 'projects', action: 'view', description: 'View all projects' },
    { name: 'projects.view.own', resource: 'projects', action: 'view.own', description: 'View own projects only' },
    { name: 'projects.update', resource: 'projects', action: 'update', description: 'Update any project' },
    { name: 'projects.update.own', resource: 'projects', action: 'update.own', description: 'Update own projects' },
    { name: 'projects.delete', resource: 'projects', action: 'delete', description: 'Delete projects' },
    { name: 'projects.approve', resource: 'projects', action: 'approve', description: 'Approve projects' },
    { name: 'projects.reject', resource: 'projects', action: 'reject', description: 'Reject projects' },
    { name: 'projects.impact.view', resource: 'projects', action: 'impact.view', description: 'View impact projects' },
    
    { name: 'investments.create', resource: 'investments', action: 'create', description: 'Create investments' },
    { name: 'investments.view', resource: 'investments', action: 'view', description: 'View all investments' },
    { name: 'investments.view.own', resource: 'investments', action: 'view.own', description: 'View own investments' },
    { name: 'investments.update', resource: 'investments', action: 'update', description: 'Update investments' },
    { name: 'investments.cancel', resource: 'investments', action: 'cancel', description: 'Cancel investments' },
    { name: 'investments.approve', resource: 'investments', action: 'approve', description: 'Approve investments' },
    { name: 'investments.bulk', resource: 'investments', action: 'bulk', description: 'Bulk investment operations' },
    
    { name: 'auctions.create', resource: 'auctions', action: 'create', description: 'Create auctions' },
    { name: 'auctions.view', resource: 'auctions', action: 'view', description: 'View auctions' },
    { name: 'auctions.bid', resource: 'auctions', action: 'bid', description: 'Place bids' },
    { name: 'auctions.start', resource: 'auctions', action: 'start', description: 'Start auctions' },
    { name: 'auctions.close', resource: 'auctions', action: 'close', description: 'Close auctions' },
    
    { name: 'guarantees.request', resource: 'guarantees', action: 'request', description: 'Request guarantees' },
    { name: 'guarantees.view', resource: 'guarantees', action: 'view', description: 'View guarantees' },
    { name: 'guarantees.bid', resource: 'guarantees', action: 'bid', description: 'Bid on guarantees' },
    { name: 'guarantees.allocate', resource: 'guarantees', action: 'allocate', description: 'Allocate guarantees' },
    
    // ===== Reports =====
    { name: 'reports.regulatory.generate', resource: 'reports', action: 'regulatory.generate', description: 'Generate regulatory reports' },
    { name: 'reports.regulatory.submit', resource: 'reports', action: 'regulatory.submit', description: 'Submit regulatory reports' },
    { name: 'reports.investor.generate', resource: 'reports', action: 'investor.generate', description: 'Generate investor reports' },
    { name: 'reports.investor.view', resource: 'reports', action: 'investor.view', description: 'View investor reports' },
    { name: 'reports.coop.view', resource: 'reports', action: 'coop.view', description: 'View co-op reports' },
    { name: 'reports.institutional.*', resource: 'reports', action: 'institutional.*', description: 'All institutional report permissions' },
    
    // ===== Administration =====
    { name: 'users.manage', resource: 'users', action: 'manage', description: 'Manage users' },
    { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles' },
    { name: 'permissions.manage', resource: 'permissions', action: 'manage', description: 'Manage permissions' },
    { name: 'system.configure', resource: 'system', action: 'configure', description: 'System configuration' },
    
    // ===== Wildcard (Super Admin) =====
    { name: '*.*', resource: '*', action: '*', description: 'All permissions (Super Admin)' },
  ];

  // Create permissions
  console.log('📝 Creating permissions...');
  const createdPermissions = [];
  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: perm,
      create: perm,
    });
    createdPermissions.push(permission);
  }
  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Define roles
  const roles = [
    // ===== System Admin =====
    {
      name: 'ADMIN',
      displayName: 'Super User',
      description: 'System administrator with all permissions',
      isSystem: true,
      permissions: ['*.*'],
    },
    
    // ===== Shared Workflow Permissions (All Roles) =====
    // These are included in all roles below
    
    // ===== Workflow Roles =====
    {
      name: 'RETAIL_TRADER',
      displayName: 'Retail Trader',
      description: 'Trade commodities/services safely with escrow (TEE workflow)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // TEE
        'tee.listings.view',
        'tee.trade.create',
        'tee.trade.view.own',
        'ge.escrow.view.own',
      ],
    },
    {
      name: 'SUPPLIER',
      displayName: 'Supplier',
      description: 'Compete in reverse auctions and execute contracts (RAE workflow)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // RAE
        'rae.notice.view',
        'rae.bid.create',
        'rae.bid.view.own',
        'tee.contract.view.own',
      ],
    },
    {
      name: 'BUYER',
      displayName: 'Buyer',
      description: 'Procure goods/services efficiently with transparent scoring (RAE workflow)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // RAE
        'rae.notice.create',
        'rae.bid.review',
        'rae.award.execute',
        'rae.notice.view',
      ],
    },
    {
      name: 'COOP_ADMIN',
      displayName: 'Co-operative Admin',
      description: 'Aggregate member trade and support members with guarantees',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // Co-op
        'coop.members.manage',
        'tee.aggregate.create',
        'ge.sponsor.create',
        'reports.coop.view',
      ],
    },
    {
      name: 'SACCO_ADMIN',
      displayName: 'SACCO Admin',
      description: 'Enable safe liquidity and distribute private instruments to members',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // SACCO
        'sacco.members.manage',
        'sacco.suitability.approve',
        'settlement.instructions.view',
        'see.secondary.trade.continuous.sacco',
        'see.market.halt',
        'see.surveillance.view',
      ],
    },
    {
      name: 'ISSUER',
      displayName: 'Issuer',
      description: 'Raise capital through private placement (SEE workflow)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // SEE
        'see.issuance.create',
        'see.issuance.publish',
        'see.issuance.view.own',
      ],
    },
    {
      name: 'INVESTOR',
      displayName: 'Investor',
      description: 'Invest safely and monitor performance and impact',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // SEE
        'see.offerings.view',
        'see.invest.subscribe',
        'see.portfolio.view.own',
        'reports.investor.view',
      ],
    },
    {
      name: 'FUND_MANAGER',
      displayName: 'Fund Manager',
      description: 'Institutional execution and portfolio reporting',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // API & IRE
        'api.order.submit',
        'api.positions.read',
        'ire.portfolio.read',
        'ire.impact.read',
        // SEE
        'see.offerings.view',
        'see.invest.subscribe',
        'see.portfolio.view.own',
      ],
    },
    {
      name: 'CUSTODIAN',
      displayName: 'Deposit Manager / Custodian',
      description: 'Execute settlement instructions and reconcile',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // CDSE
        'cdse.settlement.queue.view',
        'cdse.settlement.confirm',
      ],
    },
    {
      name: 'REGULATOR',
      displayName: 'Regulator',
      description: 'Supervisory visibility with drill-down lineage (RRE read-only)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // RRE
        'rre.dashboard.view',
        'rre.reports.download',
      ],
    },
    
    // ===== Legacy Roles (Maintained for backward compatibility) =====
    {
      name: 'INDIVIDUAL_INVESTOR',
      displayName: 'Individual Investor',
      description: 'Individual investor role (legacy - maps to INVESTOR)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // Legacy investments
        'investments.create',
        'investments.view',
        'investments.view.own',
        'investments.cancel',
        'projects.view',
        'auctions.view',
        'auctions.bid',
        'reports.investor.generate',
        'reports.investor.view',
        // SEE (new)
        'see.offerings.view',
        'see.invest.subscribe',
        'see.portfolio.view.own',
      ],
    },
    {
      name: 'INSTITUTIONAL_INVESTOR',
      displayName: 'Institutional Investor',
      description: 'Institutional investor role (legacy)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // Legacy investments
        'investments.create',
        'investments.view',
        'investments.view.own',
        'investments.cancel',
        'investments.bulk',
        'projects.view',
        'auctions.view',
        'auctions.bid',
        'reports.investor.generate',
        'reports.investor.view',
        'reports.institutional.*',
        // SEE (new)
        'see.offerings.view',
        'see.invest.subscribe',
        'see.portfolio.view.own',
        // API access
        'api.order.submit',
        'api.positions.read',
      ],
    },
    {
      name: 'IMPACT_FUND',
      displayName: 'Impact Fund',
      description: 'Impact fund investor role (legacy)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // Legacy investments
        'investments.create',
        'investments.view',
        'investments.view.own',
        'investments.cancel',
        'investments.bulk',
        'projects.view',
        'projects.impact.view',
        'auctions.view',
        'auctions.bid',
        'reports.investor.generate',
        'reports.investor.view',
        'reports.institutional.*',
        // SEE (new)
        'see.offerings.view',
        'see.invest.subscribe',
        'see.portfolio.view.own',
        // IRE
        'ire.portfolio.read',
        'ire.impact.read',
        // API access
        'api.order.submit',
        'api.positions.read',
      ],
    },
    {
      name: 'SME_STARTUP',
      displayName: 'SME/Startup',
      description: 'Small business/startup fundraiser role (legacy)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // Legacy projects
        'projects.create',
        'projects.view.own',
        'projects.update.own',
        'auctions.create',
        'guarantees.request',
        'guarantees.view',
      ],
    },
    {
      name: 'SOCIAL_ENTERPRISE',
      displayName: 'Social Enterprise',
      description: 'Social enterprise fundraiser role (legacy)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // Legacy projects
        'projects.create',
        'projects.view.own',
        'projects.update.own',
        'projects.impact.view',
        'auctions.create',
        'guarantees.request',
        'guarantees.view',
      ],
    },
    {
      name: 'REAL_ESTATE_PROJECT',
      displayName: 'Real Estate Project',
      description: 'Real estate project fundraiser role (legacy)',
      isSystem: true,
      permissions: [
        // Shared
        'auth.login',
        'auth.refresh',
        'profile.view.own',
        'profile.update.own',
        'permissions.view.own',
        // Legacy projects
        'projects.create',
        'projects.view.own',
        'projects.update.own',
        'auctions.create',
        'guarantees.request',
        'guarantees.view',
      ],
    },
  ];

  // Create roles and assign permissions
  console.log('👥 Creating roles...');
  const createdRoles = [];
  for (const roleData of roles) {
    const role = await prisma.role.upsert({
      where: { name: roleData.name },
      update: {
        displayName: roleData.displayName,
        description: roleData.description,
        isSystem: roleData.isSystem,
      },
      create: {
        name: roleData.name,
        displayName: roleData.displayName,
        description: roleData.description,
        isSystem: roleData.isSystem,
      },
    });

    // Assign permissions to role
    for (const permName of roleData.permissions) {
      const permission = createdPermissions.find((p) => p.name === permName);
      if (permission) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
      }
    }

    createdRoles.push(role);
  }
  console.log(`✅ Created ${createdRoles.length} roles with permissions`);

  // Assign roles to existing users based on their current role
  console.log('🔗 Assigning roles to existing users...');
  const users = await prisma.user.findMany();
  let assignedCount = 0;

  for (const user of users) {
    // Find matching role
    let roleName = user.role;
    
    // Map legacy roles to new role names
    // Keep legacy role names for backward compatibility, but also support new workflow roles
    if (roleName === 'ADMIN') {
      roleName = 'ADMIN';
    } else if (roleName?.includes('INVESTOR')) {
      if (roleName === 'IMPACT_FUND') {
        roleName = 'IMPACT_FUND'; // Keep legacy name
      } else if (roleName === 'INSTITUTIONAL_INVESTOR') {
        roleName = 'INSTITUTIONAL_INVESTOR'; // Keep legacy name
      } else {
        roleName = 'INDIVIDUAL_INVESTOR'; // Keep legacy name, but could also map to 'INVESTOR'
      }
    } else if (roleName === 'SME_STARTUP' || roleName === 'SOCIAL_ENTERPRISE' || roleName === 'REAL_ESTATE_PROJECT') {
      roleName = roleName; // Keep legacy names
    } else if (roleName === 'RETAIL_TRADER' || roleName === 'retail_trader') {
      roleName = 'RETAIL_TRADER';
    } else if (roleName === 'SUPPLIER' || roleName === 'supplier') {
      roleName = 'SUPPLIER';
    } else if (roleName === 'BUYER' || roleName === 'buyer') {
      roleName = 'BUYER';
    } else if (roleName === 'COOP_ADMIN' || roleName === 'coop_admin') {
      roleName = 'COOP_ADMIN';
    } else if (roleName === 'SACCO_ADMIN' || roleName === 'sacco_admin') {
      roleName = 'SACCO_ADMIN';
    } else if (roleName === 'ISSUER' || roleName === 'issuer') {
      roleName = 'ISSUER';
    } else if (roleName === 'INVESTOR' || roleName === 'investor') {
      roleName = 'INVESTOR';
    } else if (roleName === 'FUND_MANAGER' || roleName === 'fund_manager') {
      roleName = 'FUND_MANAGER';
    } else if (roleName === 'CUSTODIAN' || roleName === 'custodian') {
      roleName = 'CUSTODIAN';
    } else if (roleName === 'REGULATOR' || roleName === 'regulator') {
      roleName = 'REGULATOR';
    } else {
      // Default to RETAIL_TRADER for new users (most common entry point)
      roleName = 'RETAIL_TRADER';
    }

    const role = createdRoles.find((r) => r.name === roleName);
    if (role) {
      // Check if user already has this role
      const existing = await prisma.userRole.findFirst({
        where: {
          userId: user.id,
          roleId: role.id,
          contextType: 'GLOBAL',
          contextId: null,
        },
      });

      if (!existing) {
        await prisma.userRole.create({
          data: {
            userId: user.id,
            roleId: role.id,
            contextType: 'GLOBAL',
            contextId: null,
            isActive: true,
          },
        });
        assignedCount++;
      }
    }
  }

  console.log(`✅ Assigned roles to ${assignedCount} users`);

  console.log('🎉 RBAC seeding completed!');
}

seedRBAC()
  .catch((e) => {
    console.error('❌ Error seeding RBAC:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

