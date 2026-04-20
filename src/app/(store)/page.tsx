import Link from "next/link";
import { db } from "@/lib/db";
import { ArrowRight, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import HeroSection from "@/components/store/HeroSection";
import InstagramReels from "@/components/store/InstagramReels";

export const dynamic = "force-dynamic";

async function getHomeData() {
    const [featuredProducts, categories] = await Promise.all([
        db.product.findMany({
            where: { isActive: true, isFeatured: true },
            take: 4,
            include: { category: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
        }),
        db.category.findMany({
            where: { isActive: true },
            include: {
                _count: { select: { products: { where: { isActive: true } } } },
                products: {
                    where: { isActive: true },
                    orderBy: { createdAt: "desc" },
                    take: 8, // Changed to 8 to show max 8 items per category for bundles
            select: {
                        id: true,
                        name: true,
                        slug: true,
                        images: true,
                    }
                }
            },
        }),
    ]);
    return { featuredProducts, categories };
}

export default async function HomePage() {
    const { featuredProducts, categories } = await getHomeData();

    return (
        <div className="bg-black text-white min-h-screen w-full">
            {/* HERO SECTION - Dynamic Featured Products */}
            <HeroSection products={featuredProducts} />

            {/* INSTAGRAM SECTION */}
            <InstagramReels />

            {/* CURATED CATEGORIES */}
            {categories.length > 0 && (
                <section className="py-32 relative">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16">
                            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-foreground drop-shadow-sm">
                                THE ARCHIVES
                            </h2>
                            <Link href="/categories" className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-[0.2em] border-b-2 border-primary/50 pb-1 hover:text-primary hover:border-primary transition-all">
                                EXPLORE ALL
                            </Link>
                        </div>

                        <div className="flex overflow-x-auto gap-6 sm:gap-8 pb-8 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                            {categories.map((cat, idx) => (
                                <div
                                    key={cat.id}
                                    className="min-w-[85vw] sm:min-w-[400px] md:min-w-[480px] relative h-[450px] overflow-hidden rounded-[2.5rem] glass-panel border border-white/10 flex flex-col p-8 shadow-xl shrink-0 snap-center group"
                                >
                                    {/* Main Category Image Background */}
                                    {cat.image && (
                                        <img src={cat.image} className="absolute inset-y-0 right-0 h-[85%] w-[65%] object-contain object-right z-0 top-[10%] pr-4 drop-shadow-2xl mix-blend-screen transition-transform duration-700 group-hover:scale-105" alt={cat.name} />
                                    )}

                                    {/* Top Content */}
                                    <div className="relative z-20 flex flex-col items-start w-full">
                                        <h3 className="font-bold text-3xl sm:text-4xl text-white mb-4 max-w-[65%] leading-tight drop-shadow-md">{cat.name}</h3>
                                        
                                        <Link href={`/products?category=${cat.slug}`}>
                                            <Button className="rounded-full bg-white text-black hover:bg-white/90 px-8 py-6 text-sm font-bold transition-all shadow-lg mt-1 tracking-widest uppercase">
                                                Shop all
                                            </Button>
                                        </Link>
                                    </div>

                                    {/* Bottom row: Top 2 newer products */}
                                    {cat.products && cat.products.length > 0 && (
                                        <div className="absolute bottom-8 left-8 right-8 flex items-end justify-start gap-4 z-20">
                                            {cat.products.slice(0, 2).map((product) => (
                                                <Link 
                                                    href={`/products/${product.slug}`} 
                                                    key={product.id}
                                                    className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black/60 backdrop-blur-md shadow-xl border border-white/10 hover:border-white/20 hover:bg-black/80 transition-all hover:-translate-y-1 min-w-[80px] max-w-[100px]"
                                                >
                                                    <div className="w-12 h-12 relative mb-2">
                                                        {product.images[0] ? (
                                                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain drop-shadow-md" />
                                                        ) : (
                                                          <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-lg border border-white/5">
                                                            <Package className="w-5 h-5 text-white/40" />
                                                          </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-bold text-white text-center w-full truncate px-1 uppercase tracking-wider">
                                                        {product.name}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FEATURED EDIT */}
            {featuredProducts.length > 0 && (
                <section className="py-32 relative">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row items-baseline justify-between mb-16">
                            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter text-foreground drop-shadow-sm">
                                THE EDIT
                            </h2>
                            <Link href="/products" className="mt-4 md:mt-0 text-xs font-bold uppercase tracking-[0.2em] border-b-2 border-primary/50 pb-1 hover:text-primary hover:border-primary transition-all">
                                VIEW CATALOG
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                            {featuredProducts.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/products/${product.slug}`}
                                    className="group flex flex-col glass-panel rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-2"
                                >
                                    <div className="aspect-[4/5] bg-secondary/50 rounded-xl overflow-hidden relative mb-6">
                                        {product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                        {product.compareAtPrice && (
                                            <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-md text-primary-foreground rounded-full text-xs font-bold tracking-widest px-4 py-1.5 uppercase shadow-lg">
                                                SALE
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground uppercase tracking-wide mb-2 line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
                                            {product.compareAtPrice && (
                                                <span className="text-muted-foreground line-through text-sm">₹{product.compareAtPrice.toLocaleString("en-IN")}</span>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* PRODUCT BUNDLE / CATEGORY-WISE LIST */}
            {categories.length > 0 && (
                <section className="py-16 md:py-24 relative bg-black text-white border-t border-white/10">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">
                                BUNDLES & COLLECTIONS
                            </h2>
                            <p className="mt-4 text-white/50 uppercase tracking-widest text-sm font-semibold">
                                Shop Our Curated Products
                            </p>
                        </div>

                        <div className="space-y-24">
                            {categories.map((cat) => {
                                if (!cat.products || cat.products.length === 0) return null;
                                
                                return (
                                    <div key={cat.id} className="flex flex-col gap-6 border-b border-white/10 pb-16 last:border-0 last:pb-0">
                                        <div className="flex items-end justify-between border-l-4 border-[#1877F2] pl-4">
                                            <h3 className="text-3xl font-black uppercase tracking-tight text-white">{cat.name}</h3>
                                            <Link href={`/products?category=${cat.slug}`} className="text-[#1877F2] font-bold uppercase tracking-wider text-xs hover:text-[#1877F2]/80 transition-colors">
                                                See all
                                            </Link>
                                        </div>
                                        
                                        <div className="flex overflow-x-auto gap-4 sm:gap-6 pb-6 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                            {cat.products.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/products/${product.slug}`}
                                                    className="group flex flex-col bg-black glass-panel rounded-2xl p-4 transition-transform duration-300 hover:-translate-y-2 shadow-xl min-w-[160px] sm:min-w-[200px] md:min-w-[240px] shrink-0 snap-start"
                                                >
                                                    <div className="aspect-[4/5] bg-secondary/30 rounded-xl overflow-hidden relative mb-4">
                                                        {product.images[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <Package className="w-8 h-8 text-white/20" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-white uppercase tracking-tight text-sm line-clamp-2 leading-tight">
                                                            {product.name}
                                                        </h4>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* GLASS CTA */}
            <section className="py-32 relative">
                <div className="max-w-4xl mx-auto px-4 text-center glass-panel rounded-3xl p-16">
                    <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        PARTNER WITH CREDO
                    </h2>
                    <p className="text-lg text-foreground/80 font-medium max-w-2xl mx-auto mb-12">
                        For bulk orders, custom curation, and bespoke branding requests. Elevate your corporate relationships.
                    </p>
                    <Link href="/contact">
                        <Button size="lg" className="rounded-full shadow-lg shadow-primary/20">
                            INQUIRE NOW
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
