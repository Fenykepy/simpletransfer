export function validateEmail(email: string) {
  if (email.trim().length === 0) {
    return "Email is required"
  }
  if (email.length > 255) {
    return `Email too long: "${email}"`
  }
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (!re.test(email.toLowerCase())) {
    return `Invalid email: "${email}"`
  }
}

export function validatePassword(password: string) {
  if (password.trim().length < 6) {
    return "Password must be at least 6 characters long"
  }
}