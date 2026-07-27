## ui-hallmark-clerk-integration

The Hallmark design system is enforced by overriding default Tailwind classes and Clerk's appearance prop. For auth pages, we use a split-screen layout avoiding AppShell. We inject custom OKLCH tokens (var(--color-paper), var(--color-ink), var(--color-rule), var(--color-accent)) into Clerk using appearance={{ variables: { colorPrimary: '#10B981' }, elements: { card: 'bg-[var(--color-paper)] border border-[var(--color-rule)]', ... } }}. The PortalDashboard uses useAppShell context and avoids generic colors like bg-blue-50 or text-red-500, replacing them with proper ink/paper contrast.

**Type:** pattern  
**Tags:** ui, hallmark, clerk, shadcn  
**Updated:** 7/27/2026
