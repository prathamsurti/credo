import Link from "next/link";
import { Gift, Mail, Phone, MapPin } from "lucide-react";

export default function StoreFooter() {
    return (
        <footer className="relative bg-black text-white overflow-hidden border-t border-white/5 mt-auto">
            {/* Liquid Morphism Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-50%] left-[0%] w-[60vw] h-[60vw] rounded-full bg-white/5 blur-[150px] mix-blend-screen" style={{ animation: 'pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <div className="absolute bottom-[-30%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-white/5 blur-[120px] mix-blend-screen" style={{ animation: 'pulse 10s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-20 backdrop-blur-3xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 bg-black/40 p-10 rounded-3xl border border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] backdrop-blur-md">
                    {/* Brand */}
                    <div className="space-y-6">
                        <Link href="/" className="flex items-center gap-3">
                            <span className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">CREDO</span>
                        </Link>
                        <p className="text-sm text-balance text-white/60 leading-relaxed">
                            Premium case protection and mobile accessories designed to make an indelible mark. Uncompromising quality for your devices.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Quick Links</h3>
                        <ul className="space-y-3">
                            {[
                                { label: "Products", href: "/products" },
                                { label: "Categories", href: "/categories" },
                                { label: "About Us", href: "/about" },
                                { label: "Blog", href: "/blog" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm font-medium tracking-wide text-white/50 hover:text-blue-400 transition-colors drop-shadow-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Customer Service</h3>
                        <ul className="space-y-3">
                            {[
                                { label: "My Account", href: "/account/orders" },
                                { label: "Track Order", href: "/account/orders" },
                                { label: "Wishlist", href: "/wishlist" },
                                { label: "Privacy Policy", href: "/privacy" },
                            ].map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-sm font-medium tracking-wide text-white/50 hover:text-blue-400 transition-colors drop-shadow-sm">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-widest">Get in Touch</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-4">
                                <span className="bg-white/5 p-2 rounded-full border border-white/5">
                                    <Mail className="w-4 h-4 text-white" />
                                </span>
                                <span className="text-sm tracking-wide text-white/70 mt-1">hello@credo.com</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="bg-white/5 p-2 rounded-full border border-white/5">
                                    <Phone className="w-4 h-4 text-white" />
                                </span>
                                <span className="text-sm tracking-wide text-white/70 mt-1">+1 (555) 000-0000</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-white/40 font-medium tracking-wider">
                        © {new Date().getFullYear()} CREDO. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
