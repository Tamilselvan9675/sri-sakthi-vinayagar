import { db } from "@/lib/db";
import { getActiveFestivalYear } from "@/lib/api/festival";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Calendar, 
  Image as ImageIcon, 
  Trophy, 
  CreditCard,
  Heart,
  Clock,
  Activity
} from "lucide-react";

export default async function AdminDashboard() {
  const activeYear = await getActiveFestivalYear();
  
  // Aggregate stats across the whole DB
  const [
    totalFestivals,
    totalEvents,
    totalGalleryItems,
    totalWinners,
    totalDonations,
    totalExpenses
  ] = await Promise.all([
    db.festivalYear.count(),
    db.event.count(),
    db.galleryItem.count(),
    db.winner.count(),
    db.donation.aggregate({ _sum: { amount: true } }),
    db.expense.aggregate({ _sum: { amount: true } })
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Welcome back to the temple administration portal.
        </p>
      </div>

      {activeYear ? (
        <Card className="bg-primary/5 border-primary/20 shadow-md rounded-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <Activity className="w-48 h-48 text-primary" />
          </div>
          <CardHeader className="pb-4 border-b border-primary/10 bg-background/50 backdrop-blur">
            <CardTitle className="text-xl flex items-center gap-3 font-display text-primary">
              <div className="p-2 bg-primary/10 rounded-full">
                <Calendar className="w-5 h-5" />
              </div>
              Active Festival: {activeYear.titleEn} ({activeYear.year})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background rounded-xl p-4 border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Events</div>
                <div className="text-3xl font-display font-bold text-foreground">{activeYear.events.length}</div>
              </div>
              <div className="bg-background rounded-xl p-4 border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Pooja Schedules</div>
                <div className="text-3xl font-display font-bold text-foreground">{activeYear.poojaSchedules.length}</div>
              </div>
              <div className="bg-background rounded-xl p-4 border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Winners</div>
                <div className="text-3xl font-display font-bold text-foreground">{activeYear.winners.length}</div>
              </div>
              <div className="bg-background rounded-xl p-4 border border-border/50 shadow-sm hover:border-primary/30 transition-colors">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Gallery Albums</div>
                <div className="text-3xl font-display font-bold text-foreground">{activeYear.galleryAlbums.length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-border rounded-2xl bg-muted/20">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-display text-lg font-semibold text-foreground">No Active Festival</h3>
            <p className="text-muted-foreground">Please create a festival year in the Festivals section.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-display font-bold tracking-tight text-foreground flex items-center gap-2">
          Global Statistics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Festivals" value={totalFestivals} icon={Calendar} />
          <StatCard title="Total Events" value={totalEvents} icon={Clock} />
          <StatCard title="Gallery Photos" value={totalGalleryItems} icon={ImageIcon} />
          <StatCard title="Total Winners" value={totalWinners} icon={Trophy} />
          <StatCard 
            title="Total Donations" 
            value={`₹${totalDonations._sum.amount?.toFixed(2) || "0.00"}`} 
            icon={Heart} 
            className="text-green-600 dark:text-green-500"
            bgClass="bg-green-500/5 border-green-500/20"
          />
          <StatCard 
            title="Total Expenses" 
            value={`₹${totalExpenses._sum.amount?.toFixed(2) || "0.00"}`} 
            icon={CreditCard} 
            className="text-red-600 dark:text-red-500"
            bgClass="bg-red-500/5 border-red-500/20"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  className = "",
  bgClass = "bg-card border-border/50"
}: { 
  title: string, 
  value: string | number, 
  icon: React.ElementType, 
  className?: string,
  bgClass?: string
}) {
  return (
    <Card className={`rounded-2xl shadow-sm hover:shadow-md transition-shadow border ${bgClass}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg bg-background shadow-sm border border-border/50`}>
          <Icon className={`h-4 w-4 text-muted-foreground ${className}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-display font-bold text-foreground mt-2 ${className}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
