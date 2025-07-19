export default function DisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="text-center font-mono">
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-4">
          Sorry, I’ve disabled this page for now 😭💀
        </h1>
        <p className="text-zinc-400 text-sm sm:text-base">
          You can still go to{' '}
          <a
            href="https://nextjs-errordumb.vercel.app/nsfw"
            className="underline text-blue-400 hover:text-blue-300 transition"
          >
            https://nextjs-errordumb.vercel.app/nsfw
          </a>{' '}
          if you want this functionality.
        </p>
      </div>
    </div>
  )
}
