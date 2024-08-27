import Header from '@/components/Header';

export default function DashboardLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex h-screen flex-col'>
      <Header className='bg-pbHeaderBlue' />
      {children}
    </div>
  );
}
