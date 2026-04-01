export interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
  category: "short" | "long" | "pants" | "tanktop";
}

export const products: Product[] = [
  // Short
  { id: "s1", name: "Spider Shirt", price: "225EGP", image: "/imges/short/1.png", category: "short" },
  { id: "s2", name: "Spider Black", price: "225EGP", image: "/imges/short/2.png", category: "short" },
  { id: "s3", name: "Batman Red", price: "225EGP", image: "/imges/short/3.png", category: "short" },
  { id: "s4", name: "Batman Shirt", price: "225EGP", image: "/imges/short/4.png", category: "short" },
  // Long
  { id: "l1", name: "Sleve Dark", price: "267EGP", image: "/imges/long/1-removebg-preview.png", category: "long" },
  { id: "l2", name: "Sleve Normal", price: "267EGP", image: "/imges/long/2-removebg-preview.png", category: "long" },
  { id: "l3", name: "Sleve", price: "267EGP", image: "/imges/long/3-removebg-preview.png", category: "long" },
  { id: "l4", name: "Batman White", price: "267EGP", image: "/imges/long/4-removebg-preview.png", category: "long" },
  { id: "l5", name: "Long Spiderman", price: "267EGP", image: "/imges/long/5-removebg-preview.png", category: "long" },
  { id: "l6", name: "Batman White 2", price: "267EGP", image: "/imges/long/6-removebg-preview.png", category: "long" },
  // Pants
  { id: "p1", name: "Black", price: "467EGP", image: "/imges/swet pants/1-removebg-preview.png", category: "pants" },
  { id: "p2", name: "Iced Gray", price: "467EGP", image: "/imges/swet pants/2-removebg-preview.png", category: "pants" },
  { id: "p3", name: "Shadow Pant", price: "467EGP", image: "/imges/swet pants/3-removebg-preview-removebg-preview.png", category: "pants" },
  { id: "p4", name: "White", price: "467EGP", image: "/imges/swet pants/4-removebg-preview.png", category: "pants" },
  // Tank Top
  { id: "t1", name: "Dark Gray", price: "225EGP", image: "/imges/tank tops/1-removebg-preview.png", category: "tanktop" },
  { id: "t2", name: "Light Gray", price: "225EGP", image: "/imges/tank tops/2-removebg-preview.png", category: "tanktop" },
  { id: "t3", name: "Olive Green", price: "225EGP", image: "/imges/tank tops/3-removebg-preview.png", category: "tanktop" },
  { id: "t4", name: "Black", price: "225EGP", image: "/imges/tank tops/4-removebg-preview.png", category: "tanktop" },
];
