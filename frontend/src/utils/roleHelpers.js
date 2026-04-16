export function isAdminUser(user) {
  return user?.role === "admin";
}

export function isPatientUser(user) {
  return user?.role === "patient";
}
