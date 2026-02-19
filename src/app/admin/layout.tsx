'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import {
  LayoutDashboard,
  Shield,
  Calculator,
  Users,
  Home,
  Trophy,
  Wand2,
  Camera,
  Library,
  Handshake,
  Image as ImageIcon,
  BarChart,
} from 'lucide-react';
import { useAdmin } from '@/context/admin-context';
import React from 'react';

const adminNavItems = [
  { href: '/admin', label: 'Панель управления', icon: LayoutDashboard },
  { href: '/admin/analytics', label: 'Аналитика', icon: BarChart },
  { href: '/admin/leagues', label: 'Управление лигами', icon: Library },
  { href: '/admin/tournaments', label: 'Турниры', icon: Trophy },
  { href: '/admin/scoring', label: 'Подсчет очков', icon: Calculator },
  { href: '/admin/players', label: 'Игроки', icon: Users },
  { href: '/admin/style-studio', label: 'Студия стилей', icon: Wand2 },
  { href: '/admin/photo-studio', label: 'Фотостудия', icon: Camera },
  { href: '/admin/partners', label: 'Партнеры', icon: Handshake },
  { href: '/admin/background', label: 'Фон страницы', icon: ImageIcon },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isDirty, setIsDirty } = useAdmin();

  const handleLeaveAdminPanel = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDirty) {
      if (!window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите покинуть панель администратора?')) {
        e.preventDefault();
      } else {
        setIsDirty(false); // User confirms, allow navigation and reset dirty state
      }
    }
  };

  const handleAdminNav = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isDirty) {
       if (!window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите покинуть эту страницу?')) {
        e.preventDefault();
      }
      // Don't reset dirty state, as we are still in the admin panel
    }
  }


  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="border-b">
          <div className="flex items-center justify-between p-2">
            <Link href="/" aria-label="Home" onClick={handleLeaveAdminPanel} prefetch={true}>
              <Logo />
            </Link>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {adminNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin')} className="font-medium" tooltip={item.label}>
                  <Link href={item.href} onClick={handleAdminNav} prefetch={true}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="font-medium" tooltip="Вернуться в приложение">
                <Link href="/" onClick={handleLeaveAdminPanel} prefetch={true}>
                  <Home/>
                  <span>Вернуться</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </Sidebar>
      <SidebarInset>
        <main className="flex-1 p-4 md:p-8">
           <div className="flex items-center gap-4 mb-8">
            <SidebarTrigger className="md:hidden"/>
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-semibold">Панель администратора</h1>
          </div>
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
