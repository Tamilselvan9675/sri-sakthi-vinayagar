import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Calendar, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  Trophy, 
  Settings, 
  Users, 
  CreditCard,
  Heart,
  LogOut,
  Clock,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AdminLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await props.params;

  if (!session?.user) {
    redirect(`/${locale}/admin/login`);
  }

  const role = session.user.role;

  const navItems = [
    { name: "Dashboard", href: `/${locale}/admin`, icon: LayoutDashboard, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR", "FINANCE_MANAGER"] },
    { name: "Festival Years", href: `/${locale}/admin/festivals`, icon: Calendar, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
    { name: "Events", href: `/${locale}/admin/events`, icon: Clock, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
    { name: "Pooja Schedule", href: `/${locale}/admin/pooja`, icon: Heart, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
    { name: "Gallery", href: `/${locale}/admin/gallery`, icon: ImageIcon, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
    { name: "Videos", href: `/${locale}/admin/videos`, icon: Video, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
    { name: "Invitations", href: `/${locale}/admin/invitations`, icon: FileText, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
    { name: "Winners", href: `/${locale}/admin/winners`, icon: Trophy, roles: ["SUPER_ADMIN", "ADMIN", "EDITOR"] },
    { name: "Organizers", href: `/${locale}/admin/organizers`, icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
    { name: "Expenses", href: `/${locale}/admin/expenses`, icon: CreditCard, roles: ["SUPER_ADMIN", "FINANCE_MANAGER"] },
    { name: "Donations", href: `/${locale}/admin/donations`, icon: Heart, roles: ["SUPER_ADMIN", "FINANCE_MANAGER"] },
    { name: "Settings", href: `/${locale}/admin/settings`, icon: Settings, roles: ["SUPER_ADMIN"] },
  ];

  const visibleNavItems = navItems.filter(item => item.roles.includes(role as string));

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border/50 hidden md:flex flex-col shadow-sm relative z-20">
        <div className="p-6 border-b border-border/50 h-20 flex items-center justify-between">
          <Link href={`/${locale}/admin`} className="flex flex-col">
            <h2 className="font-display font-bold text-xl tracking-tight text-primary leading-none">Sakthi Vinayagar</h2>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mt-1">Admin Portal</span>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <div className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest mb-4 px-2">Menu</div>
          {visibleNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
            >
              <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-border/50 bg-muted/20">
          <div className="flex items-center gap-3 px-3 py-3 bg-background rounded-xl border border-border/50 mb-3 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner">
              {session.user.name?.[0] || session.user.email?.[0] || 'U'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate text-foreground">{session.user.name || 'Admin'}</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate">{role}</span>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <Button variant="outline" className="w-full justify-start text-muted-foreground hover:text-foreground rounded-xl border-border/50 hover:bg-muted/50" type="submit">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-background md:rounded-l-2xl md:-ml-2 z-10 shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.1)] relative border-l border-border/50 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-card border-b border-border/50 flex items-center justify-between px-4 md:hidden shadow-sm relative z-20">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="font-display font-bold text-lg text-primary">Admin Portal</h2>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {session.user.name?.[0] || 'U'}
          </div>
        </header>
        
        <div className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <div className="max-w-7xl mx-auto">
            {props.children}
          </div>
        </div>
      </main>
    </div>
  );
}
