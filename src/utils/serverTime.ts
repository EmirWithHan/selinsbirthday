export async function getServerNow(): Promise<number | null> {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  baseUrl.searchParams.set('t', String(Date.now()));

  const readDateHeader = async (method: 'HEAD' | 'GET') => {
    const response = await fetch(baseUrl.toString(), {
      method,
      cache: 'no-store',
    });
    const dateHeader = response.headers.get('Date');
    if (!dateHeader) {
      return null;
    }
    const timestamp = new Date(dateHeader).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  };

  try {
    return (await readDateHeader('HEAD')) ?? (await readDateHeader('GET'));
  } catch {
    try {
      return await readDateHeader('GET');
    } catch {
      return null;
    }
  }
}
