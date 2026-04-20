import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Electronics",
        slug: "electronics",
        description: "Electronic devices and gadgets",
        image: "https://images.unsplash.com/photo-1505694915051-a733f37338d5?w=500",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Fashion",
        slug: "fashion",
        description: "Clothing and accessories",
        image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Home & Garden",
        slug: "home-garden",
        description: "Home decor and garden products",
        image: "https://images.unsplash.com/photo-1456235034996-ba2c5ee22b68?w=500",
        isActive: true,
      },
    }),
    prisma.category.create({
      data: {
        name: "Books",
        slug: "books",
        description: "Books and learning materials",
        image: "https://images.unsplash.com/photo-1507842484871-e71b99dd4e0e?w=500",
        isActive: true,
      },
    }),
  ]);

  // Create products
  await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: "Wireless Headphones",
        slug: "wireless-headphones",
        description: "High-quality wireless headphones with noise cancellation",
        price: 79.99,
        compareAtPrice: 99.99,
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        ],
        categoryId: categories[0].id,
        stock: 50,
        minOrder: 1,
        isActive: true,
        isFeatured: true,
        tags: ["audio", "wireless", "headphones"],
      },
    }),
    prisma.product.create({
      data: {
        name: "USB-C Cable",
        slug: "usb-c-cable",
        description: "Durable USB-C charging and data cable",
        price: 12.99,
        compareAtPrice: 19.99,
        images: [
          "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500",
        ],
        categoryId: categories[0].id,
        stock: 200,
        minOrder: 1,
        isActive: true,
        isFeatured: true,
        tags: ["cable", "usb-c", "charging"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Smart Watch",
        slug: "smart-watch",
        description: "Advanced fitness tracking smart watch",
        price: 199.99,
        compareAtPrice: 249.99,
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        ],
        categoryId: categories[0].id,
        stock: 30,
        minOrder: 1,
        isActive: true,
        isFeatured: false,
        tags: ["watch", "fitness", "smart"],
      },
    }),
    // Fashion
    prisma.product.create({
      data: {
        name: "Cotton T-Shirt",
        slug: "cotton-tshirt",
        description: "Comfortable 100% cotton t-shirt",
        price: 19.99,
        compareAtPrice: 29.99,
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        ],
        categoryId: categories[1].id,
        stock: 150,
        minOrder: 1,
        isActive: true,
        isFeatured: true,
        tags: ["clothing", "tshirt", "cotton"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Denim Jeans",
        slug: "denim-jeans",
        description: "Classic blue denim jeans",
        price: 49.99,
        compareAtPrice: 69.99,
        images: [
          "https://images.unsplash.com/photo-1542272604-787c62d465d1?w=500",
        ],
        categoryId: categories[1].id,
        stock: 80,
        minOrder: 1,
        isActive: true,
        isFeatured: false,
        tags: ["clothing", "jeans", "denim"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Leather Jacket",
        slug: "leather-jacket",
        description: "Premium black leather jacket",
        price: 149.99,
        compareAtPrice: 199.99,
        images: [
          "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500",
        ],
        categoryId: categories[1].id,
        stock: 25,
        minOrder: 1,
        isActive: true,
        isFeatured: true,
        tags: ["clothing", "jacket", "leather"],
      },
    }),
    // Home & Garden
    prisma.product.create({
      data: {
        name: "Decorative Lamp",
        slug: "decorative-lamp",
        description: "Modern decorative table lamp",
        price: 34.99,
        compareAtPrice: 49.99,
        images: [
          "https://images.unsplash.com/photo-1565636192335-14a8ce9f2ea0?w=500",
        ],
        categoryId: categories[2].id,
        stock: 40,
        minOrder: 1,
        isActive: true,
        isFeatured: false,
        tags: ["home", "lamp", "decor"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Plant Pot Set",
        slug: "plant-pot-set",
        description: "Set of 3 ceramic plant pots",
        price: 24.99,
        compareAtPrice: 34.99,
        images: [
          "https://images.unsplash.com/photo-1585654280215-11e6218fa012?w=500",
        ],
        categoryId: categories[2].id,
        stock: 60,
        minOrder: 1,
        isActive: true,
        isFeatured: true,
        tags: ["home", "plants", "pots"],
      },
    }),
    // Books
    prisma.product.create({
      data: {
        name: "JavaScript Guide",
        slug: "javascript-guide",
        description: "Comprehensive guide to JavaScript programming",
        price: 39.99,
        compareAtPrice: 49.99,
        images: [
          "https://images.unsplash.com/photo-1507842931957-d7c4b2eab6f8?w=500",
        ],
        categoryId: categories[3].id,
        stock: 45,
        minOrder: 1,
        isActive: true,
        isFeatured: true,
        tags: ["books", "programming", "javascript"],
      },
    }),
    prisma.product.create({
      data: {
        name: "Web Design Fundamentals",
        slug: "web-design-fundamentals",
        description: "Learn the basics of modern web design",
        price: 44.99,
        compareAtPrice: 59.99,
        images: [
          "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=500",
        ],
        categoryId: categories[3].id,
        stock: 35,
        minOrder: 1,
        isActive: true,
        isFeatured: false,
        tags: ["books", "design", "web"],
      },
    }),
  ]);

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
