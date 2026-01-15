export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to Next.js Template
        </h1>
        <p className="text-center text-gray-600 mb-4">
          A production-ready Next.js template with TypeScript and best practices
        </p>
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Get started by editing <code className="font-mono bg-gray-100 px-2 py-1 rounded">app/page.tsx</code>
          </p>
        </div>
      </div>
    </main>
  );
}

