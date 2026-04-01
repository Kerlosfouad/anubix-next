import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
    <section className="flex justify-center items-center min-h-[calc(100vh-56px)] px-6">
      <div className="max-w-lg text-center flex flex-col items-center gap-6">
        <h2 className="font-smooch text-[64px] leading-none">ABOUT</h2>
        <div className="w-12 h-[2px] bg-black" />
        <p className="text-base leading-relaxed text-gray-700">
          We are a brand specialized in selling gym clothes in Egypt that provide you with
          freedom and an attractive shape during exercise. Our brand is characterized by
          sweat-repellent material, which allows you to experience a wonderful workout.
        </p>
        <a
          href="/shop"
          className="mt-2 inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition-colors"
        >
          <i className="ri-shopping-bag-line" />
          Shop Now
        </a>
      </div>
    </section>
    <Footer />
    </>
  );
}
