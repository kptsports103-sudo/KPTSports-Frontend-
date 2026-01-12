import { can } from "./permissions";

export const POLICIES = {
  USER_EDIT: ({ subject, resource }) =>
    can(subject, "USER_EDIT"),

  USER_DISABLE: ({ subject, resource }) =>
    can(subject, "USER_DISABLE") && subject.id !== resource.id,

  USER_VIEW: ({ subject, resource }) =>
    can(subject, "USER_VIEW")
};

export const authorize = (policy, ctx) => {
  const fn = POLICIES[policy];
  if (!fn) return false;
  return fn(ctx);
};