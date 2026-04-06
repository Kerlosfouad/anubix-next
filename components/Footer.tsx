import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex w-full justify-between items-center p-3 mt-auto">
      <div>
        <a href="#" className="text-black text-sm">AR | EN</a>
      </div>
      <div className="flex gap-4 items-center">
        <a href="#" target="_blank" className="text-black text-xl"><i className="ri-facebook-circle-fill" /></a>
        <a href="https://www.instagram.com/anubix_egypt" target="_blank" className="text-black text-xl"><i className="ri-instagram-fill" /></a>
        <a href="#" target="_blank" className="text-black text-xl"><i className="ri-twitter-x-fill" /></a>
        <Link href="/admin" className="text-black/30 hover:text-black transition-colors text-lg ml-2">
          <i className="ri-settings-3-line" />
        </Link>
      </div>
    </footer>
  );
}
