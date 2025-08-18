import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function MarketingLanding(): JSX.Element {
  return (
    <div className='space-y-10'>
      {/* Hero */}
      <section className='relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-8 text-white'>
        <div className='relative z-10 mx-auto max-w-5xl text-center'>
          <h1 className='text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl'>
            Grow faster with AI‑powered ICPs and Campaigns
          </h1>
          <p className='mx-auto mt-4 max-w-2xl text-white/90'>
            Understand your ideal customers, generate on‑brand campaigns, and
            launch with confidence — all in one place.
          </p>

          <div className='mt-6 flex items-center justify-center gap-3'>
            <Button
              size='lg'
              className='bg-white text-slate-900 hover:bg-white/90'>
              Get Started
            </Button>
            <Button
              size='lg'
              variant='secondary'
              className='bg-white/10 text-white hover:bg-white/20'>
              See How It Works
            </Button>
          </div>
        </div>
        <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_40%),radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.15),transparent_40%)]' />
      </section>

      {/* Highlights */}
      <section className='grid gap-6 md:grid-cols-3'>
        <Card>
          <CardHeader>
            <CardTitle>AI ICP Builder</CardTitle>
            <CardDescription>
              Generate precise ideal customer profiles with actionable insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Leverage LangChain agents and local LLMs to analyze your market
              and customers.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Campaign Designer</CardTitle>
            <CardDescription>
              Create high‑converting campaigns tailored to your ICP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Choose media types, copy styles, and generate assets with one
              click.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>tRPC + Redis + Postgres</CardTitle>
            <CardDescription>
              Fast, type‑safe APIs with caching and robust persistence.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-muted-foreground'>
              Built for performance and reliability with a clean, modular
              architecture.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* How it works */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
            <CardDescription>
              Go from insights to campaigns in minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className='list-inside list-decimal space-y-2 text-sm text-muted-foreground'>
              <li>Create or select your company</li>
              <li>Generate ICPs with AI analysis</li>
              <li>Design campaigns aligned with your ICP</li>
              <li>Review, iterate, and export assets</li>
            </ol>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className='text-center'>
        <Button size='lg'>Start Building</Button>
      </section>
    </div>
  );
}
