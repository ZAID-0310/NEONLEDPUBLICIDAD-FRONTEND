export const getUserRoleString = (user) => {
  if (!user) return null;

  let rawRole = user.rol || user.role;

  if (!rawRole) return null;

  if (Array.isArray(rawRole)) {
    rawRole = rawRole[0];
  }

  if (typeof rawRole === 'object') {
    rawRole = rawRole.slug || rawRole.name || rawRole.title;
  }

  return rawRole ? rawRole.toString().toLowerCase().trim() : null;
};



