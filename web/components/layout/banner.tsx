import Link from 'next/link'

export default function Banner() {
  return (
    <div className="top-0 z-50 h-12 sm:h-8 border-b bg-pandemica-blue/70 dark:bg-pandemica-blue/50 border-pandemica-blue text-white flex items-center justify-center">
      <p className="sm:text-sm text-xs sm:p-0 p-5 text-center">
        <b>New ✨</b> Paper is now fully available in English.{' '}
        <Link href="/paper" className="underline underline-offset-2">
          Check it out →
        </Link>
      </p>
    </div>
  )
}
