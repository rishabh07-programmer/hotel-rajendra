const ROLE_KEY = {
  owner: 'owner',
  waiter: 'waiter',
  kitchen: 'kitchen',
  developer: 'dev'
}

export function saveAuth(role, token, name) {
  const key = ROLE_KEY[role] || role
  localStorage.setItem(`${key}_token`, token)
  localStorage.setItem(`${key}_role`, role)
  localStorage.setItem(`${key}_name`, name)
}

export function getAuth(role) {
  const key = ROLE_KEY[role] || role
  return {
    token: localStorage.getItem(`${key}_token`),
    role: localStorage.getItem(`${key}_role`),
    name: localStorage.getItem(`${key}_name`)
  }
}

export function clearAuth(role) {
  const key = ROLE_KEY[role] || role
  localStorage.removeItem(`${key}_token`)
  localStorage.removeItem(`${key}_role`)
  localStorage.removeItem(`${key}_name`)
}
