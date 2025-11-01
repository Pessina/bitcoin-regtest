export function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const secondsAgo = Math.floor((now - timestamp * 1000) / 1000);

  if (secondsAgo < 0) {
    return 'just now';
  }

  if (secondsAgo < 60) {
    return `${secondsAgo}s ago`;
  }

  const minutesAgo = Math.floor(secondsAgo / 60);
  if (minutesAgo < 60) {
    return `${minutesAgo}m ago`;
  }

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) {
    return `${hoursAgo}h ago`;
  }

  const daysAgo = Math.floor(hoursAgo / 24);
  if (daysAgo < 7) {
    return `${daysAgo}d ago`;
  }

  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatTimeAgoWithTooltip(timestamp: number): {
  timeAgo: string;
  fullDate: string;
} {
  return {
    timeAgo: formatTimeAgo(timestamp),
    fullDate: new Date(timestamp * 1000).toLocaleString(),
  };
}
