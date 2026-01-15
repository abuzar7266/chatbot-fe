export const metadata = {
  title: 'About | Next.js Template',
  description: 'About page example',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">About</h1>
      <p className="text-gray-600 mb-4">
        This is an example about page demonstrating Next.js App Router structure.
      </p>
      <p className="text-gray-600">
        Pages are created by adding a <code className="bg-gray-100 px-2 py-1 rounded">page.tsx</code> file
        in the app directory.
      </p>
    </div>
  );
}

