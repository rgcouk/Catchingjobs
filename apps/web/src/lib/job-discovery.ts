/** Role categories describe the advertised role, never its employment contract. */
export function matchesRoleCategory(job: { title: string }, role: string) {
  const isDriver = /\bdriv(?:er|ing)\b/i.test(job.title);
  if (role === 'driver') return isDriver;
  if (role === 'catcher') return /\bcatch(?:er|ing)\b/i.test(job.title) && !isDriver;
  return true;
}

/** Match advertised locations only; this is not a distance or postcode lookup. */
export function matchesJobLocation(
  job: {
    townName?: string;
    townId?: string;
    regionName?: string;
    regionId?: string;
    county?: string;
  },
  location: string,
) {
  const query = location.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  return (
    !query ||
    [job.townName, job.townId, job.regionName, job.regionId, job.county].some((value) =>
      value?.trim().replace(/\s+/g, ' ').toLocaleLowerCase().includes(query),
    )
  );
}

export function locationSearchPath(location: string) {
  const town = location.trim().replace(/\s+/g, ' ');
  const params = new URLSearchParams();
  if (town) params.set('town', town);
  return `/jobs${params.size ? `?${params}` : ''}`;
}
