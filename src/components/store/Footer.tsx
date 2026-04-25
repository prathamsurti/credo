import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function StoreFooter() {
    return (
        <footer className="bg-[#1c1c1c] text-white pt-16 pb-8 mt-auto font-sans">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Section - Links & Brand */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-6 lg:col-span-5 space-y-6">
                        <Link href="/" className="inline-block">
                            <span className="text-2xl font-bold uppercase tracking-wider text-white">CREDO</span>
                        </Link>
                        <p className="text-[#a3a3a3] text-sm leading-relaxed max-w-sm">
                            As an international brand with a global creative spirit, CREDO proudly operated from two headquarters in Hong Kong and Los Angeles
                        </p>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-6 lg:col-span-7 grid grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-[#a3a3a3] font-semibold mb-6 text-sm uppercase tracking-wide">Home</h3>
                            <ul className="space-y-4">
                                {[
                                    { label: "Overview", href: "/" },
                                    { label: "Shop", href: "/products" },
                                    { label: "Collection", href: "/categories" },
                                    { label: "About us", href: "/about" },
                                    { label: "Contact", href: "/contact" },
                                ].map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-white hover:text-[#a3a3a3] transition-colors text-sm font-medium">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-[#a3a3a3] font-semibold mb-6 text-sm uppercase tracking-wide">Collection</h3>
                            <ul className="space-y-4">
                                {[
                                    { label: "Extreme Cases", href: "/categories" },
                                    { label: "Slim Cases", href: "/categories" },
                                    { label: "Extreme Compatible", href: "/categories" },
                                    { label: "Collaboration", href: "/categories" },
                                ].map((link) => (
                                    <li key={link.label}>
                                        <Link href={link.href} className="text-white hover:text-[#a3a3a3] transition-colors text-sm font-medium">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Newsletter Section */}
                <div className="bg-[#333333] rounded-3xl p-8 md:p-12 flex items-center justify-between mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-[#a3a3a3] tracking-tight">
                        Enter email to subscription...
                    </h2>
                    <button className="bg-white rounded-full p-3 md:p-4 hover:bg-gray-200 transition-colors shrink-0">
                        <ChevronRight className="w-6 h-6 text-black" />
                    </button>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-[#333333]">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white">
                        <span>© {new Date().getFullYear()} - Credo - Powered by Credo</span>
                        <span className="text-[#a3a3a3] px-2">•</span>
                        <Link href="/privacy" className="hover:text-[#a3a3a3] transition-colors">Privacy policy</Link>
                        <span className="text-[#a3a3a3] px-2">•</span>
                        <Link href="/terms" className="hover:text-[#a3a3a3] transition-colors">Terms of service</Link>
                    </div>

                    <div className="flex items-center gap-8">
                        {/* Fake Payment Icons */}
                        <div className="flex items-center gap-2">
                            <div className="bg-white text-[10px] text-blue-800 font-black px-2 py-1 rounded-sm tracking-tighter">VISA</div>
                            <div className="bg-white flex px-1 py-1 rounded-sm gap-0.5 max-h-[22px]">
                                <div className="w-3 h-3 bg-red-600 rounded-full mix-blend-multiply opacity-90"></div>
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mix-blend-multiply opacity-90 -ml-1.5"></div>
                            </div>
                            <div className="bg-white text-[10px] text-blue-500 font-bold px-1.5 py-1 rounded-sm italic">AMEX</div>
                            <div className="bg-white text-[9px] text-[#003087] font-bold px-1.5 py-1 rounded-sm italic">PayPal</div>
                        </div>

                        {/* Selectors */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-white">
                            <button className="flex items-center gap-1 hover:text-[#a3a3a3] transition-colors">
                                English <span className="text-[10px]">▼</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-[#a3a3a3] transition-colors">
                                USD $ <span className="text-[10px]">▼</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
