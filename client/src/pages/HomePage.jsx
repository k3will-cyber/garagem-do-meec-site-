import React, { useState, useCallback, useEffect } from 'react';
import TopBar from '../components/TopBar';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Servicos from '../components/Servicos';
import Galeria from '../components/Galeria';
import BeforeAfter from '../components/BeforeAfter';
import Numeros from '../components/Numeros';
import Processo from '../components/Processo';
import QuemE from '../components/QuemE';
import Estoque from '../components/Estoque';
import Contato from '../components/Contato';
import Footer from '../components/Footer';
import CartSidebar from '../components/CartSidebar';
import Lightbox from '../components/Lightbox';
import WheelPopup from '../components/WheelPopup';
import useCart from '../hooks/useCart';
import useWheel from '../hooks/useWheel';

export default function HomePage() {
  const cart = useCart();
  const wheel = useWheel();
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const openLightbox = useCallback((src) => setLightboxSrc(src), []);
  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  const addToCart = useCallback(
    (product) => {
      cart.addItem(product);
      if (!cart.isOpen) cart.toggleCart();
    },
    [cart]
  );

  const handleOpenCart = useCallback(() => {
    cart.toggleCart();
  }, [cart]);

  const handleOpenWheelReg = useCallback(() => {
    wheel.openRegModal();
  }, [wheel]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080A]">
      <TopBar vagas={3} />
      <Navbar
        onOpenWheel={handleOpenWheelReg}
        onOpenCart={handleOpenCart}
        cartCount={cart.count}
      />
      <Hero
        onOpenWheelReg={handleOpenWheelReg}
        wheelProps={{
          canvasRef: wheel.canvasRef,
          isSpinning: wheel.isSpinning,
          spinCount: wheel.spinCount,
          showRegModal: wheel.showRegModal,
          showResultModal: wheel.showResultModal,
          currentPrize: wheel.currentPrize,
          regData: wheel.regData,
          setRegData: wheel.setRegData,
          onSpin: wheel.spin,
          onCloseReg: wheel.closeRegModal,
          onCloseResult: wheel.closeResultModal,
          onOpenReg: wheel.openRegModal,
        }}
      />
      <Servicos />
      <Galeria onOpenLightbox={openLightbox} />
      <BeforeAfter />
      <Numeros />
      <Processo />
      <QuemE />
      <Estoque onAddToCart={addToCart} onOpenCart={handleOpenCart} />
      <Contato />
      <Footer />

      <CartSidebar
        items={cart.items}
        isOpen={cart.isOpen}
        total={cart.total}
        onClose={cart.closeCart}
        onUpdateQty={cart.updateQuantity}
        onRemove={cart.removeItem}
        onCheckout={cart.checkoutWhatsApp}
      />

      <Lightbox src={lightboxSrc} onClose={closeLightbox} />

      <WheelPopup
        show={wheel.showPopup}
        onClose={wheel.closePopup}
        onOpenWheel={wheel.openWheelFromPopup}
      />
    </div>
  );
}
