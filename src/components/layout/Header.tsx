interface HeaderProps {}

export function Header({}: HeaderProps) {
  return (
    <div className='flex items-center justify-between px-6 pt-2 md:pt-4 lg:pt-6'>
      <div>
        <h1 className='text-3xl font-bold font-headline tracking-tight'>
          ICP &amp; Campaign Insights
        </h1>
        <p className='text-muted-foreground'>
          Generate customer profiles and design winning campaigns with AI.
        </p>
      </div>
    </div>
  );
}
