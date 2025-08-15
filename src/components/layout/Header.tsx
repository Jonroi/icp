interface HeaderProps {}

export function Header({}: HeaderProps) {
  return (
    <div className='flex items-center justify-between'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold tracking-tight lg:text-4xl'>
          ICP &amp; Campaign Insights
        </h1>
        <p className='text-muted-foreground text-sm lg:text-base'>
          Generate customer profiles and design winning campaigns with AI.
        </p>
      </div>
    </div>
  );
}
