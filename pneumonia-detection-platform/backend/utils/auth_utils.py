def require_role(user_role, allowed_roles=None):
    if allowed_roles is None:
        allowed_roles = {"admin"}
    return user_role in allowed_roles
