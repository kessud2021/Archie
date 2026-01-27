import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-mc-white gap-8">
      <h1 className="text-mc-6 lg:text-mc-8 font-bold">
        <span className="text-redify-100">4</span>
        <span className="text-redify-200">0</span>
        <span className="text-redify-300">4</span>
      </h1>
      <p className="text-mc-1.5 lg:text-mc-2 text-mc-gray text-center">
        Looks like the page you&apos;re trying to reach does not exist
      </p>
      <Link href="/" className="text-blueify-400 hover:underline">
        Go back home
      </Link>
    </div>
  );
}
