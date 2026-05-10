import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  CreditCard,
  Filter,
  Heart,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { affiliates, coupons, mockOrders, products, sellers } from './data/mock';
import type { CartItem, PaymentMethod, Product } from './types';

type Page = 'home' | 'catalog' | 'product' | 'cart' | 'checkout' | 'success' | 'account' | 'favorites' | 'affiliate' | 'admin' | 'about' | 'policy' | 'contact';

const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

const productPrice = (product: Product) => product.salePrice ?? product.price;

function AppShell() {
  const [page, setPage] = useState<Page>('home');
  const [selectedProductId, setSelectedProductId] = useState(products[0].id);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState('');
  const store = useStore();

  const selectedProduct = products.find((product) => product.id === selectedProductId) ?? products[0];

  const navigate = (nextPage: Page, productId?: string) => {
    if (productId) setSelectedProductId(productId);
    setPage(nextPage);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Announcement />
      <Header page={page} navigate={navigate} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main>
        {page === 'home' && <Home navigate={navigate} />}
        {page === 'catalog' && <Catalog navigate={navigate} />}
        {page === 'product' && <ProductPage product={selectedProduct} navigate={navigate} />}
        {page === 'cart' && <CartPage navigate={navigate} />}
        {page === 'checkout' && <CheckoutPage navigate={navigate} setLastOrderId={setLastOrderId} />}
        {page === 'success' && <SuccessPage orderId={lastOrderId} navigate={navigate} />}
        {page === 'account' && <AccountPage />}
        {page === 'favorites' && <FavoritesPage navigate={navigate} />}
        {page === 'affiliate' && <AffiliatePage />}
        {page === 'admin' && <AdminPage navigate={navigate} />}
        {page === 'about' && <StaticPage type="about" />}
        {page === 'policy' && <StaticPage type="policy" />}
        {page === 'contact' && <ContactPage />}
      </main>
      <Footer navigate={navigate} />
      <button className="whatsapp" aria-label="Abrir WhatsApp ficticio" onClick={() => alert('WhatsApp ficticio: atendimento premium Maison Aura.')}>
        WA
      </button>
      {store.toast && <Toast message={store.toast.message} tone={store.toast.tone} />}
      <NewsletterModal />
    </div>
  );
}

function Announcement() {
  return <div className="announcement">Frete gratis acima de R$ 499 | 10% OFF no Pix com PERFUME10 | Atendimento premium todos os dias</div>;
}

function Header({
  page,
  navigate,
  menuOpen,
  setMenuOpen,
}: {
  page: Page;
  navigate: (page: Page, productId?: string) => void;
  menuOpen: boolean;
  setMenuOpen: (value: boolean) => void;
}) {
  const { cart, favorites } = useStore();
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const nav = [
    ['home', 'Home'],
    ['catalog', 'Catalogo'],
    ['favorites', 'Favoritos'],
    ['affiliate', 'Afiliados'],
    ['admin', 'Admin'],
  ] as const;

  return (
    <header className="header">
      <div className="header-inner">
        <button className="icon-btn mobile-only" aria-label="Abrir menu" onClick={() => setMenuOpen(true)}>
          <Menu size={20} />
        </button>
        <button className="brand" onClick={() => navigate('home')} aria-label="Ir para home">
          <span>Maison Aura</span>
          <small>Perfumes</small>
        </button>
        <nav className="desktop-nav" aria-label="Navegacao principal">
          {nav.map(([key, label]) => (
            <button key={key} className={page === key ? 'active' : ''} onClick={() => navigate(key)}>
              {label}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button className="icon-btn" aria-label="Area do cliente" onClick={() => navigate('account')}>
            <User size={19} />
          </button>
          <button className="icon-btn count-btn" aria-label="Favoritos" onClick={() => navigate('favorites')}>
            <Heart size={19} />
            {favorites.length > 0 && <span>{favorites.length}</span>}
          </button>
          <button className="icon-btn count-btn" aria-label="Carrinho" onClick={() => navigate('cart')}>
            <ShoppingBag size={19} />
            {cartCount > 0 && <span>{cartCount}</span>}
          </button>
        </div>
      </div>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <button className="icon-btn close" aria-label="Fechar menu" onClick={() => setMenuOpen(false)}>
          <X size={20} />
        </button>
        {nav.map(([key, label]) => (
          <button key={key} onClick={() => navigate(key)}>
            {label}
          </button>
        ))}
        <button onClick={() => navigate('about')}>Sobre nos</button>
        <button onClick={() => navigate('contact')}>Contato</button>
      </div>
    </header>
  );
}

function Home({ navigate }: { navigate: (page: Page, productId?: string) => void }) {
  const bestSellers = products.filter((product) => product.tag === 'mais vendido').slice(0, 4);
  const launches = products.filter((product) => product.tag === 'lancamento').slice(0, 4);
  const kits = products.filter((product) => product.category === 'Kits');

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Alta perfumaria ficticia</span>
          <h1>Fragrancias premium para presenca inesquecivel.</h1>
          <p>Perfumes importados, arabes, femininos, masculinos e unissex em uma experiencia de compra elegante, rapida e segura.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => navigate('catalog')}>
              Comprar agora <ArrowRight size={18} />
            </button>
            <button className="secondary" onClick={() => navigate('product', products[2].id)}>
              Ver Oud Royal
            </button>
          </div>
        </div>
        <div className="hero-visual" aria-label="Composicao visual de perfumes premium">
          <BottleArt tone="noir" size="large" />
          <BottleArt tone="gold" size="medium" />
          <BottleArt tone="rose" size="small" />
        </div>
      </section>
      <Benefits compact />
      <section className="section">
        <SectionHeader eyebrow="Curadoria" title="Compre por categoria" action="Ver catalogo" onAction={() => navigate('catalog')} />
        <div className="category-grid">
          {['Importados', 'Arabes', 'Femininos', 'Masculinos', 'Unissex', 'Kits'].map((category, index) => (
            <button className="category-tile" key={category} onClick={() => navigate('catalog')}>
              <BottleArt tone={['gold', 'noir', 'rose', 'sage', 'amber', 'ivory'][index]} size="tiny" />
              <span>{category}</span>
              <small>{products.filter((product) => product.category === category).length || 4} produtos</small>
            </button>
          ))}
        </div>
      </section>
      <ProductRail title="Mais vendidos" products={bestSellers} navigate={navigate} />
      <section className="feature-band">
        <div>
          <span className="eyebrow">Lancamento</span>
          <h2>Aura Noir Intense</h2>
          <p>O contraste entre oud, especiarias e musk branco em uma assinatura profunda, moderna e elegante.</p>
          <button className="primary" onClick={() => navigate('product', products[0].id)}>
            Conhecer perfume
          </button>
        </div>
        <BottleArt tone="noir" size="large" />
      </section>
      <ProductRail title="Lancamentos" products={launches} navigate={navigate} />
      <ProductRail title="Kits presenteaveis" products={kits} navigate={navigate} />
      <section className="occasion section">
        <SectionHeader eyebrow="Ocasiões" title="Escolha pelo momento" />
        <div className="pill-grid">
          {['Presente', 'Uso diario', 'Noite', 'Luxo', 'Romance'].map((item) => (
            <button key={item} onClick={() => navigate('catalog')}>
              {item}
            </button>
          ))}
        </div>
      </section>
      <section className="section split">
        <div>
          <span className="eyebrow">Familias olfativas</span>
          <h2>Da leveza citrica ao oud intenso.</h2>
        </div>
        <div className="family-list">
          {['Floral oriental', 'Amadeirado', 'Citrico aromatico', 'Gourmand', 'Oud especiado', 'Musk limpo'].map((family) => (
            <button key={family} onClick={() => navigate('catalog')}>
              {family}
            </button>
          ))}
        </div>
      </section>
      <Testimonials />
      <Newsletter />
    </>
  );
}

function Catalog({ navigate }: { navigate: (page: Page, productId?: string) => void }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');
  const [gender, setGender] = useState('Todos');
  const [family, setFamily] = useState('Todos');
  const [brand, setBrand] = useState('Todos');
  const [tag, setTag] = useState('Todos');
  const [sort, setSort] = useState('Mais vendidos');

  const categories = ['Todos', ...Array.from(new Set(products.map((product) => product.category)))];
  const genders = ['Todos', 'feminino', 'masculino', 'unissex'];
  const families = ['Todos', ...Array.from(new Set(products.map((product) => product.family)))];
  const brands = ['Todos', ...Array.from(new Set(products.map((product) => product.brand)))];
  const tags = ['Todos', 'mais vendido', 'lancamento', 'promocao', 'exclusivo'];

  const filtered = useMemo(() => {
    const result = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return (
        matchesSearch &&
        (category === 'Todos' || product.category === category) &&
        (gender === 'Todos' || product.gender === gender) &&
        (family === 'Todos' || product.family === family) &&
        (brand === 'Todos' || product.brand === brand) &&
        (tag === 'Todos' || product.tag === tag)
      );
    });
    return result.sort((a, b) => {
      if (sort === 'Menor preco') return productPrice(a) - productPrice(b);
      if (sort === 'Maior preco') return productPrice(b) - productPrice(a);
      if (sort === 'Melhor avaliacao') return b.rating - a.rating;
      if (sort === 'Novidades') return Number(b.id.split('-')[1]) - Number(a.id.split('-')[1]);
      return b.reviews - a.reviews;
    });
  }, [search, category, gender, family, brand, tag, sort]);

  return (
    <section className="page-grid catalog-page">
      <aside className="filters">
        <div className="filter-title">
          <Filter size={18} />
          Filtros
        </div>
        <FilterSelect label="Categoria" value={category} setValue={setCategory} options={categories} />
        <FilterSelect label="Marca ficticia" value={brand} setValue={setBrand} options={brands} />
        <FilterSelect label="Genero" value={gender} setValue={setGender} options={genders} />
        <FilterSelect label="Familia olfativa" value={family} setValue={setFamily} options={families} />
        <FilterSelect label="Tag" value={tag} setValue={setTag} options={tags} />
      </aside>
      <div>
        <div className="catalog-toolbar">
          <div>
            <span className="eyebrow">Catalogo</span>
            <h1>{filtered.length} fragrancias encontradas</h1>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar perfume" />
          </label>
          <FilterSelect label="Ordenar" value={sort} setValue={setSort} options={['Mais vendidos', 'Menor preco', 'Maior preco', 'Melhor avaliacao', 'Novidades']} />
        </div>
        {filtered.length ? (
          <div className="product-grid">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} navigate={navigate} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum perfume encontrado" text="Ajuste filtros ou busque outro nome." />
        )}
      </div>
    </section>
  );
}

function ProductPage({ product, navigate }: { product: Product; navigate: (page: Page, productId?: string) => void }) {
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState('');
  const { addToCart, sellerId, setSellerId } = useStore();
  const related = products.filter((item) => item.family === product.family && item.id !== product.id).slice(0, 4);

  return (
    <section className="product-page">
      <button className="back-link" onClick={() => navigate('catalog')}>
        <ChevronLeft size={18} /> Voltar ao catalogo
      </button>
      <div className="product-detail">
        <div className="gallery">
          <div className="main-image">
            <BottleArt tone={product.tone} size="large" />
          </div>
          <div className="thumbs">
            {[product.tone, 'gold', 'ivory'].map((tone) => (
              <button key={tone} aria-label={`Visual ${tone}`}>
                <BottleArt tone={tone} size="tiny" />
              </button>
            ))}
          </div>
        </div>
        <div className="buy-box">
          <span className="badge">{product.tag}</span>
          <h1>{product.name}</h1>
          <p className="muted">{product.brand} | {product.gender} | {product.volume}</p>
          <Rating product={product} />
          <Price product={product} />
          <p className="installments">Em ate 6x de {money(productPrice(product) / 6)} sem juros ou 5% OFF no Pix.</p>
          <div className="selector-row">
            <Quantity value={quantity} setValue={setQuantity} />
            <label>
              Consultor
              <select value={sellerId} onChange={(event) => setSellerId(event.target.value)}>
                {sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>
                    {seller.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="cep-box">
            Calcular frete ficticio
            <div>
              <input value={cep} onChange={(event) => setCep(event.target.value)} placeholder="00000-000" />
              <span>{cep.length >= 8 ? 'Entrega expressa em 3 dias' : 'Frete gratis acima de R$ 499'}</span>
            </div>
          </label>
          <div className="buy-actions">
            <button className="primary" onClick={() => addToCart(product.id, quantity)}>
              Adicionar ao carrinho
            </button>
            <button
              className="secondary"
              onClick={() => {
                addToCart(product.id, quantity);
                navigate('cart');
              }}
            >
              Comprar
            </button>
          </div>
          <div className="trust-list">
            <span><ShieldCheck size={17} /> Selo de originalidade ficticio</span>
            <span><Truck size={17} /> Troca simples em ate 7 dias</span>
            <span><PackageCheck size={17} /> Embalagem premium protegida</span>
          </div>
        </div>
      </div>
      <div className="product-info">
        <div>
          <h2>Descricao</h2>
          <p>{product.description}</p>
        </div>
        <div>
          <h2>Notas olfativas</h2>
          <div className="notes">
            <Note label="Topo" notes={product.topNotes} />
            <Note label="Coracao" notes={product.heartNotes} />
            <Note label="Fundo" notes={product.baseNotes} />
          </div>
        </div>
        <div>
          <h2>Avaliacoes</h2>
          <div className="review-list">
            <p>"Fixacao excelente e embalagem impecavel." <strong>- cliente verificado</strong></p>
            <p>"Perfume sofisticado, chegou muito rapido." <strong>- compra premium</strong></p>
          </div>
        </div>
      </div>
      <ProductRail title="Produtos relacionados" products={related.length ? related : products.slice(0, 4)} navigate={navigate} />
    </section>
  );
}

function CartPage({ navigate }: { navigate: (page: Page, productId?: string) => void }) {
  const store = useStore();
  const summary = useSummary(store.cart, store.couponCode);
  const crossSell = products.filter((product) => !store.cart.some((item) => item.productId === product.id)).slice(0, 3);

  if (!store.cart.length) {
    return (
      <section className="section narrow">
        <EmptyState title="Carrinho vazio" text="Escolha uma fragrancia para montar seu ritual Maison Aura." />
        <button className="primary center" onClick={() => navigate('catalog')}>
          Ver catalogo
        </button>
      </section>
    );
  }

  return (
    <section className="checkout-layout">
      <div>
        <span className="eyebrow">Carrinho</span>
        <h1>Sua selecao</h1>
        <CartItems />
        <div className="coupon-row">
          <CouponInput />
          <label>
            Consultor responsavel
            <select value={store.sellerId} onChange={(event) => store.setSellerId(event.target.value)}>
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>{seller.name}</option>
              ))}
            </select>
          </label>
        </div>
        <ProductRail title="Complete sua compra" products={crossSell} navigate={navigate} compact />
      </div>
      <OrderSummary summary={summary} actionLabel="Finalizar compra" onAction={() => navigate('checkout')} />
    </section>
  );
}

function CheckoutPage({ navigate, setLastOrderId }: { navigate: (page: Page) => void; setLastOrderId: (id: string) => void }) {
  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [approved, setApproved] = useState(false);
  const store = useStore();
  const summary = useSummary(store.cart, store.couponCode);

  const confirm = () => {
    if (!store.cart.length) {
      navigate('catalog');
      return;
    }
    const order = store.submitOrder(payment, summary.total);
    setLastOrderId(order.id);
    setApproved(true);
    window.setTimeout(() => navigate('success'), 500);
  };

  return (
    <section className="checkout-layout">
      <div>
        <span className="eyebrow">Checkout seguro ficticio</span>
        <h1>Finalizar pedido</h1>
        <form className="form-grid" onSubmit={(event) => event.preventDefault()}>
          <fieldset>
            <legend>Dados do cliente</legend>
            <input aria-label="Nome completo" placeholder="Nome completo" required />
            <input aria-label="Email" placeholder="Email" type="email" required />
            <input aria-label="Telefone" placeholder="Telefone" required />
          </fieldset>
          <fieldset>
            <legend>Endereco de entrega</legend>
            <input aria-label="CEP" placeholder="CEP" required />
            <input aria-label="Rua" placeholder="Rua" required />
            <input aria-label="Numero" placeholder="Numero" required />
            <input aria-label="Cidade" placeholder="Cidade" required />
          </fieldset>
          <fieldset>
            <legend>Frete e consultor</legend>
            <select aria-label="Frete">
              <option>Express premium - R$ 29,90</option>
              <option>Retirada boutique - Gratis</option>
            </select>
            <select value={store.sellerId} onChange={(event) => store.setSellerId(event.target.value)} aria-label="Vendedor">
              {sellers.map((seller) => (
                <option key={seller.id} value={seller.id}>{seller.name}</option>
              ))}
            </select>
            <CouponInput />
            <input aria-label="Codigo de afiliado" placeholder="Codigo de afiliado" value={store.affiliateCode} onChange={(event) => store.setAffiliateCode(event.target.value)} />
          </fieldset>
          <fieldset>
            <legend>Pagamento</legend>
            <div className="segmented">
              <button type="button" className={payment === 'card' ? 'active' : ''} onClick={() => setPayment('card')}>
                <CreditCard size={17} /> Cartao
              </button>
              <button type="button" className={payment === 'pix' ? 'active' : ''} onClick={() => setPayment('pix')}>
                Pix
              </button>
            </div>
            {payment === 'card' ? (
              <div className="form-stack">
                <input aria-label="Nome no cartao" placeholder="Nome no cartao" />
                <input aria-label="Numero do cartao" placeholder="0000 0000 0000 0000" />
                <div className="two-cols">
                  <input aria-label="Validade" placeholder="MM/AA" />
                  <input aria-label="CVV" placeholder="CVV" />
                </div>
                <select aria-label="Parcelamento">
                  <option>1x sem juros</option>
                  <option>3x sem juros</option>
                  <option>6x sem juros</option>
                </select>
              </div>
            ) : (
              <div className="pix-box">
                <div className="qr" aria-label="QR Code Pix ficticio" />
                <p>Chave Pix ficticia: pix@maisonaura.demo</p>
                <small>Pedido sera aprovado automaticamente nesta demonstracao.</small>
              </div>
            )}
          </fieldset>
        </form>
        {approved && <p className="success-note"><CheckCircle2 size={18} /> Pedido aprovado.</p>}
      </div>
      <OrderSummary summary={summary} actionLabel="Confirmar pedido" onAction={confirm} />
    </section>
  );
}

function SuccessPage({ orderId, navigate }: { orderId: string; navigate: (page: Page) => void }) {
  return (
    <section className="success-page">
      <CheckCircle2 size={52} />
      <span className="eyebrow">Pedido aprovado</span>
      <h1>{orderId || 'AUR-00000'}</h1>
      <p>Compra ficticia confirmada. O pedido guardou carrinho, cupom, afiliado e consultor selecionado.</p>
      <div className="hero-actions">
        <button className="primary" onClick={() => navigate('account')}>Ver meus pedidos</button>
        <button className="secondary" onClick={() => navigate('catalog')}>Continuar comprando</button>
      </div>
    </section>
  );
}

function AccountPage() {
  const { orders } = useStore();
  return (
    <section className="section">
      <span className="eyebrow">Area do cliente</span>
      <h1>Conta Maison Aura</h1>
      <div className="account-grid">
        <div className="panel">
          <h2>Login ficticio</h2>
          <input placeholder="Email" aria-label="Email login" />
          <input placeholder="Senha" aria-label="Senha login" type="password" />
          <button className="primary">Entrar</button>
          <button className="secondary">Criar cadastro</button>
        </div>
        <div className="panel">
          <h2>Dados pessoais</h2>
          <p>Marina Costa</p>
          <p>marina@demo.com</p>
          <p>Enderecos salvos: 2</p>
          <p>Favoritos e rastreamento disponiveis nesta demonstracao.</p>
        </div>
        <div className="panel wide">
          <h2>Meus pedidos</h2>
          {[...orders, ...sampleClientOrders].slice(0, 5).map((order) => (
            <div className="list-row" key={order.id}>
              <span>{order.id}</span>
              <strong>{money(order.total)}</strong>
              <small>{order.status}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const sampleClientOrders = [
  { id: 'AUR-8821', total: 418, status: 'Entregue' },
  { id: 'AUR-8817', total: 669, status: 'Em transporte' },
];

function FavoritesPage({ navigate }: { navigate: (page: Page, productId?: string) => void }) {
  const { favorites } = useStore();
  const favoriteProducts = products.filter((product) => favorites.includes(product.id));
  return (
    <section className="section">
      <span className="eyebrow">Wishlist</span>
      <h1>Favoritos</h1>
      {favoriteProducts.length ? (
        <div className="product-grid">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} navigate={navigate} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nenhum favorito salvo" text="Use o coracao nos cards para montar sua selecao." />
      )}
    </section>
  );
}

function AffiliatePage() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('AURA' + Math.floor(1000 + Math.random() * 8999));
  return (
    <section className="section">
      <span className="eyebrow">Afiliados</span>
      <h1>Programa Aura Partners</h1>
      <div className="affiliate-layout">
        <div className="panel">
          <h2>Cadastro ficticio</h2>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome do afiliado" aria-label="Nome afiliado" />
          <button className="primary" onClick={() => setCode((name || 'AURA').slice(0, 5).toUpperCase() + '20')}>
            Gerar link
          </button>
          <p className="copy-box">https://maisonaura.demo/?ref={code}</p>
          <p>Codigo de indicacao: <strong>{code}</strong></p>
        </div>
        <div className="dashboard-cards">
          <Metric label="Cliques" value="2.184" />
          <Metric label="Vendas geradas" value="76" />
          <Metric label="Comissao" value={money(12890)} />
          <Metric label="Pedidos indicados" value="54" />
        </div>
        <div className="panel wide">
          <h2>Top afiliados</h2>
          {affiliates.map((affiliate) => (
            <div className="list-row" key={affiliate.id}>
              <span>{affiliate.name}</span>
              <strong>{affiliate.code}</strong>
              <small>{money(affiliate.commission)}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminPage({ navigate }: { navigate: (page: Page, productId?: string) => void }) {
  const revenue = mockOrders.reduce((sum, order) => sum + order.total, 0);
  return (
    <section className="admin-page">
      <div className="admin-hero">
        <span className="eyebrow">Painel administrativo ficticio</span>
        <h1>Operacao Maison Aura</h1>
      </div>
      <div className="dashboard-cards">
        <Metric label="Faturamento" value={money(revenue)} />
        <Metric label="Pedidos" value="1.248" />
        <Metric label="Ticket medio" value={money(486)} />
        <Metric label="Conversao" value="4,8%" />
      </div>
      <div className="admin-grid">
        <div className="panel">
          <h2>Produtos mais vendidos</h2>
          {products.slice(0, 6).map((product) => (
            <button className="list-row row-button" key={product.id} onClick={() => navigate('product', product.id)}>
              <span>{product.name}</span>
              <strong>{product.stock} un.</strong>
            </button>
          ))}
        </div>
        <div className="panel">
          <h2>Vendedores</h2>
          {sellers.map((seller) => (
            <div className="list-row" key={seller.id}>
              <span>{seller.name}</span>
              <strong>{seller.sales}</strong>
              <small>{money(seller.revenue)}</small>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Pedidos</h2>
          {mockOrders.map((order) => (
            <div className="list-row" key={order.id}>
              <span>{order.id}</span>
              <strong>{money(order.total)}</strong>
              <small>{order.status}</small>
            </div>
          ))}
        </div>
        <div className="panel">
          <h2>Cupons</h2>
          {coupons.map((coupon) => (
            <div className="list-row" key={coupon.code}>
              <span>{coupon.code}</span>
              <strong>{coupon.label}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StaticPage({ type }: { type: 'about' | 'policy' }) {
  return (
    <section className="section narrow">
      <span className="eyebrow">{type === 'about' ? 'Institucional' : 'Trocas'}</span>
      <h1>{type === 'about' ? 'Sobre a Maison Aura' : 'Politica de trocas ficticia'}</h1>
      <p>
        {type === 'about'
          ? 'Maison Aura Perfumes e uma loja ficticia criada para demonstrar uma experiencia premium de e-commerce de fragrancias. A curadoria valoriza perfumes importados, arabes e autorais com linguagem comercial sofisticada.'
          : 'Trocas ficticias podem ser solicitadas em ate 7 dias. Produtos devem estar lacrados e acompanhados da embalagem original. Nenhum pagamento ou envio real acontece nesta demonstracao.'}
      </p>
    </section>
  );
}

function ContactPage() {
  return (
    <section className="section narrow">
      <span className="eyebrow">Contato</span>
      <h1>Atendimento premium</h1>
      <form className="panel form-stack" onSubmit={(event) => event.preventDefault()}>
        <input placeholder="Nome" aria-label="Nome contato" />
        <input placeholder="Email" aria-label="Email contato" />
        <textarea placeholder="Mensagem" aria-label="Mensagem" />
        <button className="primary">Enviar mensagem ficticia</button>
      </form>
    </section>
  );
}

function ProductRail({ title, products: railProducts, navigate, compact }: { title: string; products: Product[]; navigate: (page: Page, productId?: string) => void; compact?: boolean }) {
  return (
    <section className={compact ? 'section compact' : 'section'}>
      <SectionHeader eyebrow="Maison Aura" title={title} action="Ver todos" onAction={() => navigate('catalog')} />
      <div className="product-grid rail">
        {railProducts.map((product) => (
          <ProductCard key={product.id} product={product} navigate={navigate} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product, navigate }: { product: Product; navigate: (page: Page, productId?: string) => void }) {
  const { addToCart, favorites, toggleFavorite } = useStore();
  const favorite = favorites.includes(product.id);
  return (
    <article className="product-card">
      <button className="favorite" aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'} onClick={() => toggleFavorite(product.id)}>
        <Heart size={18} fill={favorite ? 'currentColor' : 'none'} />
      </button>
      <button className="product-image" onClick={() => navigate('product', product.id)} aria-label={`Ver ${product.name}`}>
        <BottleArt tone={product.tone} size="medium" />
        <span className={`badge ${product.tag === 'promocao' ? 'promo' : ''}`}>{product.tag}</span>
        {product.stock <= 5 && <span className="stock-badge">Estoque baixo</span>}
      </button>
      <div className="product-copy">
        <small>{product.brand}</small>
        <button onClick={() => navigate('product', product.id)}>{product.name}</button>
        <Rating product={product} />
        <Price product={product} />
        <p>{product.family} | {product.volume}</p>
        <button className="primary full" onClick={() => addToCart(product.id)}>
          Comprar
        </button>
      </div>
    </article>
  );
}

function CartItems() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  return (
    <div className="cart-list">
      {cart.map((item) => {
        const product = products.find((product) => product.id === item.productId)!;
        return (
          <div className="cart-item" key={item.productId}>
            <BottleArt tone={product.tone} size="tiny" />
            <div>
              <strong>{product.name}</strong>
              <small>{product.brand}</small>
              <Price product={product} compact />
            </div>
            <Quantity value={item.quantity} setValue={(quantity) => updateQuantity(item.productId, quantity)} />
            <button className="icon-btn" aria-label="Remover item" onClick={() => removeFromCart(item.productId)}>
              <X size={18} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function CouponInput() {
  const { couponCode, setCouponCode } = useStore();
  const [localCode, setLocalCode] = useState(couponCode);
  return (
    <label className="coupon-input">
      Cupom
      <div>
        <input value={localCode} onChange={(event) => setLocalCode(event.target.value)} placeholder="PERFUME10" />
        <button className="secondary" type="button" onClick={() => setCouponCode(localCode)}>
          Aplicar
        </button>
      </div>
    </label>
  );
}

function useSummary(cart: CartItem[], couponCode: string) {
  return useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const product = products.find((product) => product.id === item.productId);
      return sum + (product ? productPrice(product) * item.quantity : 0);
    }, 0);
    const coupon = coupons.find((item) => item.code === couponCode);
    const shippingBase = subtotal >= 499 ? 0 : 29.9;
    const shipping = coupon?.type === 'freeShipping' ? 0 : shippingBase;
    const discount = coupon?.type === 'percent' ? subtotal * (coupon.value / 100) : 0;
    return {
      subtotal,
      shipping,
      discount,
      total: Math.max(0, subtotal + shipping - discount),
      coupon,
    };
  }, [cart, couponCode]);
}

function OrderSummary({ summary, actionLabel, onAction }: { summary: ReturnType<typeof useSummary>; actionLabel: string; onAction: () => void }) {
  return (
    <aside className="summary">
      <h2>Resumo do pedido</h2>
      <SummaryRow label="Subtotal" value={money(summary.subtotal)} />
      <SummaryRow label="Desconto" value={`- ${money(summary.discount)}`} />
      <SummaryRow label="Frete" value={summary.shipping === 0 ? 'Gratis' : money(summary.shipping)} />
      <div className="summary-total">
        <span>Total</span>
        <strong>{money(summary.total)}</strong>
      </div>
      {summary.coupon && <p className="success-note">Cupom ativo: {summary.coupon.code}</p>}
      <button className="primary full" onClick={onAction}>{actionLabel}</button>
      <small><ShieldCheck size={14} /> Compra segura ficticia, sem transacao real.</small>
    </aside>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Quantity({ value, setValue }: { value: number; setValue: (value: number) => void }) {
  return (
    <div className="quantity" aria-label="Quantidade">
      <button aria-label="Diminuir quantidade" onClick={() => setValue(Math.max(1, value - 1))}>
        <Minus size={15} />
      </button>
      <span>{value}</span>
      <button aria-label="Aumentar quantidade" onClick={() => setValue(value + 1)}>
        <Plus size={15} />
      </button>
    </div>
  );
}

function FilterSelect({ label, value, setValue, options }: { label: string; value: string; setValue: (value: string) => void; options: string[] }) {
  return (
    <label>
      {label}
      <select value={value} onChange={(event) => setValue(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionHeader({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-header">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && <button className="text-link" onClick={onAction}>{action} <ArrowRight size={16} /></button>}
    </div>
  );
}

function Rating({ product }: { product: Product }) {
  return (
    <div className="rating" aria-label={`Avaliacao ${product.rating}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={14} fill={index < Math.round(product.rating) ? 'currentColor' : 'none'} />
      ))}
      <span>{product.rating} ({product.reviews})</span>
    </div>
  );
}

function Price({ product, compact }: { product: Product; compact?: boolean }) {
  return (
    <div className={compact ? 'price compact-price' : 'price'}>
      {product.salePrice && <del>{money(product.price)}</del>}
      <strong>{money(productPrice(product))}</strong>
    </div>
  );
}

function Benefits({ compact }: { compact?: boolean }) {
  const items = [
    [Truck, 'Frete rapido', 'Gratis acima de R$ 499'],
    [ShieldCheck, 'Pagamento seguro', 'Pix e cartao simulados'],
    [Sparkles, 'Curadoria premium', 'Perfumes e kits exclusivos'],
    [PackageCheck, 'Compra protegida', 'Originalidade ficticia'],
  ] as const;
  return (
    <section className={compact ? 'benefits compact' : 'benefits'}>
      {items.map(([Icon, title, text]) => (
        <div key={title}>
          <Icon size={22} />
          <strong>{title}</strong>
          <span>{text}</span>
        </div>
      ))}
    </section>
  );
}

function Testimonials() {
  return (
    <section className="section testimonials">
      <SectionHeader eyebrow="Clientes" title="Experiencia premium do inicio ao fim" />
      <div className="testimonial-grid">
        {['Entrega impecavel e perfume muito sofisticado.', 'Comprei o kit para presente e a embalagem surpreendeu.', 'Checkout claro, atendimento rapido e fragrancias elegantes.'].map((text, index) => (
          <blockquote key={text}>
            <Rating product={{ ...products[index], rating: 5, reviews: 120 }} />
            <p>"{text}"</p>
            <footer>Cliente Maison Aura</footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="newsletter">
      <span className="eyebrow">Newsletter</span>
      <h2>Receba curadorias e ofertas privadas.</h2>
      <div>
        <input placeholder="Seu email" aria-label="Email newsletter" />
        <button className="primary">Cadastrar</button>
      </div>
    </section>
  );
}

function NewsletterModal() {
  const [visible, setVisible] = useState(() => localStorage.getItem('aura_newsletter_closed') !== '1');
  if (!visible) return null;
  return (
    <div className="modal-backdrop">
      <div className="newsletter-modal" role="dialog" aria-modal="true" aria-label="Desconto newsletter">
        <button className="icon-btn close" aria-label="Fechar newsletter" onClick={() => {
          localStorage.setItem('aura_newsletter_closed', '1');
          setVisible(false);
        }}>
          <X size={18} />
        </button>
        <span className="eyebrow">Primeira compra</span>
        <h2>Ganhe 20% OFF</h2>
        <p>Use PRIMEIRA20 nesta demonstracao e veja o cupom funcionar no checkout.</p>
        <button className="primary full" onClick={() => {
          localStorage.setItem('aura_newsletter_closed', '1');
          setVisible(false);
        }}>Entendi</button>
      </div>
    </div>
  );
}

function Note({ label, notes }: { label: string; notes: string[] }) {
  return (
    <div>
      <strong>{label}</strong>
      <span>{notes.join(', ')}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <BarChart3 size={18} />
    </div>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="empty">
      <Sparkles size={30} />
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function Toast({ message, tone }: { message: string; tone: 'success' | 'info' | 'error' }) {
  return <div className={`toast ${tone}`}>{message}</div>;
}

function Footer({ navigate }: { navigate: (page: Page) => void }) {
  return (
    <footer className="footer">
      <div>
        <strong>Maison Aura Perfumes</strong>
        <p>Loja ficticia premium para demonstracao visual e funcional de e-commerce.</p>
      </div>
      <div>
        <button onClick={() => navigate('about')}>Sobre nos</button>
        <button onClick={() => navigate('policy')}>Politica de trocas</button>
        <button onClick={() => navigate('contact')}>Contato</button>
      </div>
      <div>
        <span>Pix ficticio</span>
        <span>Cartao ficticio</span>
        <span>Compra segura</span>
      </div>
    </footer>
  );
}

function BottleArt({ tone, size }: { tone: string; size: 'tiny' | 'small' | 'medium' | 'large' }) {
  return (
    <span className={`bottle-art ${tone} ${size}`} aria-hidden="true">
      <span />
    </span>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppShell />
    </StoreProvider>
  );
}
