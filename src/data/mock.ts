import type { Affiliate, Coupon, Product, Seller } from '../types';

const families = ['Floral oriental', 'Amadeirado', 'Citrico aromatico', 'Gourmand', 'Oud especiado', 'Musk limpo'];
const categories = ['Importados', 'Arabes', 'Femininos', 'Masculinos', 'Unissex', 'Kits'];
const brands = ['Maison Aura', 'Velour Parfums', 'Oud Atelier', 'Lumiere Notes', 'Atlas Essence', 'Noble Scent'];
const productNames = [
  'Aura Noir Intense',
  'Velour Rose',
  'Maison Oud Royal',
  'Golden Musk',
  'Eclat Blanc',
  'Vanilla Imperial',
  'Citrus Noble',
  'Amber Nuit',
  'Luna Femme',
  'Atlas Wood',
  'Flor de Peonia',
  'Santal Supreme',
  'Neroli Dore',
  'Oud Safran',
  'Iris Veloute',
  'Musk Alabaster',
  'Rose Desert',
  'Noir Cedre',
  'Aqua Noble',
  'Velvet Tonka',
  'Jasmin Royal',
  'Cuir Lumiere',
  'Aura Gift Ritual',
  'Duo Nuit Blanche',
];

export const sellers: Seller[] = [
  { id: 'camila', name: 'Camila Rocha', sales: 186, revenue: 84210 },
  { id: 'rafael', name: 'Rafael Mendes', sales: 154, revenue: 71930 },
  { id: 'bianca', name: 'Bianca Alves', sales: 139, revenue: 66880 },
  { id: 'juliana', name: 'Juliana Prado', sales: 122, revenue: 59120 },
  { id: 'online', name: 'Consultor Online', sales: 211, revenue: 101540 },
];

export const coupons: Coupon[] = [
  { code: 'PERFUME10', label: '10% de desconto', type: 'percent', value: 10 },
  { code: 'AURA15', label: '15% de desconto', type: 'percent', value: 15 },
  { code: 'FRETEGRATIS', label: 'Frete gratis', type: 'freeShipping', value: 100 },
  { code: 'PRIMEIRA20', label: '20% na primeira compra', type: 'percent', value: 20 },
];

export const affiliates: Affiliate[] = [
  { id: '1', name: 'Laura Martins', code: 'LAURA12', clicks: 1240, sales: 48, commission: 7230 },
  { id: '2', name: 'Studio Scent Club', code: 'SCENTVIP', clicks: 2120, sales: 76, commission: 12890 },
  { id: '3', name: 'Beleza Premium BR', code: 'PREMIUMBR', clicks: 980, sales: 33, commission: 4920 },
];

export const products: Product[] = productNames.map((name, index) => {
  const sale = index % 3 === 0;
  const kit = index > 21;
  const price = kit ? 589 + index * 8 : 219 + index * 17;
  const tag = index % 7 === 0 ? 'exclusivo' : index % 5 === 0 ? 'lancamento' : sale ? 'promocao' : 'mais vendido';
  return {
    id: `p-${index + 1}`,
    name,
    brand: brands[index % brands.length],
    category: kit ? 'Kits' : categories[index % (categories.length - 1)],
    gender: index % 3 === 0 ? 'feminino' : index % 3 === 1 ? 'masculino' : 'unissex',
    family: families[index % families.length],
    volume: kit ? '2 x 100ml' : index % 2 === 0 ? '100ml' : '80ml',
    price,
    salePrice: sale ? Math.round(price * 0.86) : undefined,
    rating: Number((4.4 + (index % 6) * 0.08).toFixed(1)),
    reviews: 58 + index * 11,
    description:
      'Fragrancia sofisticada com assinatura marcante, alta fixacao e evolucao elegante na pele. Criada para uma experiencia premium, com acordes equilibrados e presenca refinada.',
    topNotes: ['bergamota', 'pimenta rosa', 'pera luminosa'].slice(0, 2 + (index % 2)),
    heartNotes: ['rosa turca', 'jasmim', 'acorde ambarado'].slice(0, 2 + ((index + 1) % 2)),
    baseNotes: ['oud', 'sandalwood', 'musk branco', 'baunilha'].slice(0, 3),
    stock: index % 8 === 0 ? 4 : 18 + index,
    tag,
    tone: ['gold', 'rose', 'sage', 'noir', 'amber', 'ivory'][index % 6],
  };
});

export const mockOrders = [
  { id: 'AUR-1048', customer: 'Marina Costa', total: 738, seller: 'Camila Rocha', status: 'Entregue' },
  { id: 'AUR-1049', customer: 'Lucas Faria', total: 482, seller: 'Consultor Online', status: 'Enviado' },
  { id: 'AUR-1050', customer: 'Renata Lima', total: 1198, seller: 'Bianca Alves', status: 'Aprovado' },
  { id: 'AUR-1051', customer: 'Andre Mota', total: 329, seller: 'Rafael Mendes', status: 'Separacao' },
];
