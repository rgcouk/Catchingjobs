/** Role categories describe the advertised role, never its employment contract. */
export function matchesRoleCategory(job: { title: string }, role: string) {
  const isDriver = /\bdriv(?:er|ing)\b/i.test(job.title);
  if (role === 'driver') return isDriver;
  if (role === 'catcher') return /\bcatch(?:er|ing)\b/i.test(job.title) && !isDriver;
  return true;
}
