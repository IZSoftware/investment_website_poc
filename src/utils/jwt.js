export const decodeJwtRole = (token) => {
  try {
    if (!token) {
      console.warn('No token provided to decodeJwtRole');
      return null;
    }
    
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

    let role = null;
    
    // Try every possible role field
    if (decoded.authorities && Array.isArray(decoded.authorities)) {
      role = decoded.authorities[0]?.authority || decoded.authorities[0];
    } else if (decoded.roles && Array.isArray(decoded.roles)) {
      role = decoded.roles[0];
    } else if (decoded.role) {
      role = decoded.role;
    } else if (decoded.scope) {
      role = decoded.scope;
    } else if (decoded.userRole) {
      role = decoded.userRole;
    } else if (decoded.ROLE) {
      role = decoded.ROLE;
    } else if (decoded.permissions && Array.isArray(decoded.permissions)) {
      role = decoded.permissions[0];
    } else if (decoded.authority) {
      role = decoded.authority;
    }
    
    // Normalize the role: remove "ROLE_" prefix and convert to uppercase
    if (role && typeof role === 'string') {
      role = role.replace(/^ROLE_/i, '');
      role = role.toUpperCase(); // Convert to uppercase for consistent comparison
    }

    return role || null;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};