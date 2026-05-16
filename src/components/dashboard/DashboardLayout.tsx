import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bgDark2 font-sans selection:bg-primaryColor selection:text-white">
      <DashboardSidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <DashboardHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
