/**
 * Reusable RBAC & Field-Level Security Foundation
 */
export class RbacFoundation {
  static ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    SALES_REP: 'Sales_Rep',
    FINANCE: 'Finance',
    READ_ONLY: 'Read_Only'
  };

  /**
   * Check if a role can perform an action on a module
   * @param {string} role 
   * @param {string} module 
   * @param {string} action 
   */
  static hasPermission(role = 'Sales_Rep', module = 'Deals', action = 'write') {
    if (role === 'Admin') return true;
    if (role === 'Read_Only' && action !== 'read') return false;

    const permissions = {
      Sales_Rep: {
        Leads: ['read', 'write', 'delete'],
        Deals: ['read', 'write'],
        Quotes: ['read', 'write'],
        Products: ['read'],
        Audit: ['read']
      },
      Manager: {
        Leads: ['read', 'write', 'delete'],
        Deals: ['read', 'write', 'delete', 'approve'],
        Quotes: ['read', 'write', 'delete', 'approve'],
        Products: ['read', 'write'],
        Audit: ['read']
      },
      Finance: {
        Quotes: ['read', 'approve'],
        Deals: ['read'],
        Products: ['read'],
        Audit: ['read']
      }
    };

    const userPerms = permissions[role] || {};
    const modulePerms = userPerms[module] || [];
    return modulePerms.includes(action);
  }

  /**
   * Sanitize fields based on user role (Field-level security)
   */
  static filterSensitiveFields(data, role = 'Sales_Rep') {
    if (role === 'Admin' || role === 'Manager' || role === 'Finance') return data;
    if (!data) return data;

    const copy = { ...data };
    delete copy.costPrice;
    delete copy.margin;
    return copy;
  }
}
