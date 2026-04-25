import StoreNavbar from "@/components/store/Navbar";
import StoreFooter from "@/components/store/Footer";
import Providers from "@/components/Providers";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
    return (
        <Providers>
            <div className="min-h-screen flex flex-col bg-[#1E1E1E] text-white">
                <StoreNavbar />
                <main className="flex-1">{children}</main>
                <StoreFooter />
            </div>
        </Providers>
    );
}
