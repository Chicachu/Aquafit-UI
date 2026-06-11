import { MobileNavItem } from '@layouts/mobile/mobile-nav-item';

export function getActiveNavItem(
  currentRoute: string,
  navItems: MobileNavItem[]
): MobileNavItem | null {
  if (!currentRoute) {
    return null;
  }

  const normalizedCurrentRoute = currentRoute.replace(/\/$/, '');
  let bestMatch: MobileNavItem | null = null;
  let bestMatchLength = 0;

  for (const item of navItems) {
    const normalizedPath = item.path.replace(/\/$/, '');

    if (normalizedCurrentRoute === normalizedPath) {
      return item;
    }

    if (normalizedCurrentRoute.startsWith(normalizedPath + '/')) {
      if (normalizedPath.length > bestMatchLength) {
        bestMatch = item;
        bestMatchLength = normalizedPath.length;
      }
    }
  }

  return bestMatch;
}
