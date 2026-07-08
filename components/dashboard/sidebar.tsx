'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  LayoutDashboard,
  Calendar,
  PlusCircle,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Trophy,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

type NavItem  = { title: string; href: string; icon: LucideIcon }
type NavGroup = { title: string; icon: LucideIcon; children: NavItem[] }
type NavEntry =
  | { kind: 'link';  adminOnly: boolean; item: NavItem  }
  | { kind: 'group'; adminOnly: boolean; group: NavGroup }

const navEntries: NavEntry[] = [
  {
    kind: 'link', adminOnly: false,
    item: { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  },
  {
    kind: 'group', adminOnly: false,
    group: {
      title: 'Eventos', icon: Calendar,
      children: [
        { title: 'Mis Eventos',  href: '/dashboard/events',     icon: Calendar   },
        { title: 'Crear Evento', href: '/dashboard/events/new', icon: PlusCircle },
      ],
    },
  },
  {
    kind: 'link', adminOnly: false,
    item: { title: 'Portal participantes', href: '/eventos', icon: Trophy },
  },
  {
    kind: 'group', adminOnly: true,
    group: {
      title: 'Admin', icon: ShieldCheck,
      children: [
        { title: 'Invitaciones',  href: '/dashboard/invitaciones',        icon: Mail       },
        { title: 'Organizadores', href: '/dashboard/admin/organizadores', icon: ShieldCheck },
      ],
    },
  },
  {
    kind: 'link', adminOnly: false,
    item: { title: 'Configuración', href: '/dashboard/settings', icon: Settings },
  },
]

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout, roles } = useAuth()
  const isAdmin = roles.includes('ROLE_ADMIN')

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    for (const entry of navEntries) {
      if (entry.kind === 'group') {
        initial[entry.group.title] = entry.group.children.some((c) =>
          pathname.startsWith(c.href)
        )
      }
    }
    return initial
  })

  const toggleGroup = (title: string) =>
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }))

  const initials = user?.firstName
    ? user.firstName[0].toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? 'U'

  const linkClass = (active: boolean) =>
    cn(
      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
      active
        ? 'bg-sidebar-primary/10 text-sidebar-primary'
        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      isCollapsed && 'justify-center px-2'
    )

  const isLinkActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)

  const visibleEntries = navEntries.filter(
    (e) => !e.adminOnly || isAdmin
  )

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-20 shrink-0 items-center border-b border-sidebar-border px-3',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        {!isCollapsed && (
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/accesosport-logo.svg"
              alt="AccesoSport"
              width={1536}
              height={1024}
              className="h-16 w-auto"
              priority
            />
          </Link>
        )}
        {isCollapsed && (
          <Link href="/dashboard">
            <Image
              src="/accesosport-icon.svg"
              alt="AccesoSport"
              width={644}
              height={414}
              className="h-10 w-auto"
              priority
            />
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isCollapsed && 'hidden'
          )}
          aria-label="Colapsar sidebar"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Expand button (collapsed mode) */}
      {isCollapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label="Expandir sidebar"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {!isCollapsed && (
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60">
            Menú
          </p>
        )}
        <ul className="space-y-0.5">
          {visibleEntries.map((entry) => {
            if (entry.kind === 'link') {
              const { item } = entry
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    title={isCollapsed ? item.title : undefined}
                    className={linkClass(isLinkActive(item.href))}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </li>
              )
            }

            const { group } = entry
            const groupIsActive = group.children.some((c) => pathname.startsWith(c.href))

            if (isCollapsed) {
              return group.children.map((child) => (
                <li key={child.href}>
                  <Link
                    href={child.href}
                    title={child.title}
                    className={linkClass(isLinkActive(child.href))}
                  >
                    <child.icon className="h-[18px] w-[18px] shrink-0" />
                  </Link>
                </li>
              ))
            }

            return (
              <li key={group.title}>
                <Collapsible
                  open={openGroups[group.title]}
                  onOpenChange={(open) =>
                    setOpenGroups((prev) => ({ ...prev, [group.title]: open }))
                  }
                >
                  <CollapsibleTrigger
                    onClick={() => toggleGroup(group.title)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                      groupIsActive
                        ? 'text-sidebar-primary'
                        : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    )}
                  >
                    <group.icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left">{group.title}</span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform duration-200',
                        openGroups[group.title] && 'rotate-180'
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="mt-0.5 space-y-0.5">
                      {group.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg py-2 pl-9 pr-3 text-sm font-medium transition-colors duration-150',
                              isLinkActive(child.href)
                                ? 'bg-sidebar-primary/10 text-sidebar-primary'
                                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <child.icon className="h-[16px] w-[16px] shrink-0" />
                            <span>{child.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section */}
      <div className="shrink-0 border-t border-sidebar-border p-2">
        {!isCollapsed && user && (
          <div className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
                {user.firstName || 'Usuario'}
              </p>
              <p className="truncate text-xs text-sidebar-foreground">{user.email}</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          onClick={logout}
          title={isCollapsed ? 'Cerrar sesión' : undefined}
          className={cn(
            'w-full gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span>Cerrar sesión</span>}
        </Button>
      </div>
    </aside>
  )
}
