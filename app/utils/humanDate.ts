

export function humanDate(dateString: string) {
  // convert unix timestamp in human readable date
  let d = new Date(dateString) // convert string to int
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d)
}