import Footer from "@/components/Footer";

const contacts = [
  { icon: "ri-whatsapp-line", href: "https://api.whatsapp.com/send/?phone=%2B201032789245", label: "WhatsApp", color: "hover:text-green-500" },
  { icon: "ri-phone-line", href: "tel:+201032789245", label: "Call", color: "hover:text-blue-500" },
  { icon: "ri-telegram-line", href: "#", label: "Telegram", color: "hover:text-sky-500" },
  { icon: "ri-mail-line", href: "#", label: "Email", color: "hover:text-red-400" },
];

export default function ContactPage() {
  return (
    <>
    <section className="flex justify-center items-center min-h-[calc(100vh-56px)] px-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <h2 className="font-smooch text-[64px] leading-none">CONTACT</h2>
        <div className="w-12 h-[2px] bg-black" />
        <p className="text-sm text-gray-500 tracking-widest uppercase">Get in touch with us</p>
        <div className="flex gap-6 mt-2">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              className={`flex flex-col items-center gap-2 text-black transition-all duration-200 ${c.color} group`}
            >
              <span className="w-14 h-14 rounded-full bg-white shadow-sm flex items-center justify-center text-2xl group-hover:shadow-md transition-shadow">
                <i className={c.icon} />
              </span>
              <span className="text-xs tracking-wider uppercase font-medium">{c.label}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
    <Footer />
    </>
  );
}
