import Layout from '@/components/layout'
import Model from './model'

export default function Simulate() {
  return (
    <Layout className="h-full w-full justify-start">
      <div className="flex min-h-[80vh] w-full items-start justify-center py-10">
        <main className="relative flex w-full flex-col items-center justify-center gap-y-10 text-lg font-normal md:w-4/5 md:justify-between">
          <div className="flex flex-col items-center justify-start gap-y-10 sm:gap-y-20">
            <div className="flex h-full w-full flex-col items-center justify-start gap-y-1 px-8 md:max-w-lg lg:max-w-2xl">
              <article className="flex w-full flex-col items-start gap-y-6 pb-10 md:w-[40rem] lg:w-[50rem]">
                <h2 className="font-sans-heading from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-2xl font-semibold tracking-tighter text-transparent sm:text-3xl xl:text-4xl/none">
                  Simulation
                </h2>
                <Model />
              </article>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
