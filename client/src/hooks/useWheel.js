import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://crm-garagem.onrender.com';

const PRIZES = [
  { name: 'R$ 50 OFF', value: 50, type: 'desconto', color: '#0044CC', weight: 3 },
  { name: 'R$ 30 OFF', value: 30, type: 'desconto', color: '#0A84FF', weight: 4 },
  { name: 'R$ 20 OFF', value: 20, type: 'desconto', color: '#30D158', weight: 5 },
  { name: 'R$ 100 OFF', value: 100, type: 'desconto', color: '#F5C800', weight: 1 },
  { name: 'Brinde', value: 0, type: 'brinde', color: '#FF9F0A', weight: 3 },
  { name: 'Reviravolta', value: 0, type: 'tente_novamente', color: '#8E8E93', weight: 2 },
];

const SEGMENT_ANGLE = 360 / PRIZES.length;

function weightedRandom() {
  const totalWeight = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < PRIZES.length; i++) {
    random -= PRIZES[i].weight;
    if (random <= 0) return i;
  }
  return 0;
}

function generateCoupon() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seg1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const seg2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `MEEC-${seg1}-${seg2}`;
}

export default function useWheel() {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentPrize, setCurrentPrize] = useState(null);
  const [spinCount, setSpinCount] = useState(0);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [regData, setRegData] = useState({ name: '', whatsapp: '' });
  const rotationRef = useRef(0);
  const canvasRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSpun = localStorage.getItem('wheel_has_spun');
      if (!hasSpun) setShowPopup(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = canvas.width / 2 - 4;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    PRIZES.forEach((prize, i) => {
      const startAngle = (i * SEGMENT_ANGLE * Math.PI) / 180;
      const endAngle = ((i + 1) * SEGMENT_ANGLE * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Text
      const textAngle = startAngle + (endAngle - startAngle) / 2;
      ctx.save();
      ctx.translate(cx + Math.cos(textAngle) * radius * 0.65, cy + Math.sin(textAngle) * radius * 0.65);
      ctx.rotate(textAngle);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(prize.name, 0, 0);
      ctx.restore();
    });
    };
    drawWheel();
  }, []);

  const openRegModal = useCallback(() => setShowRegModal(true), []);
  const closeRegModal = useCallback(() => { setShowRegModal(false); setRegData({ name: '', whatsapp: '' }); }, []);
  const closeResultModal = useCallback(() => setShowResultModal(false), []);
  const closePopup = useCallback(() => setShowPopup(false), []);
  const openWheelFromPopup = useCallback(() => { setShowPopup(false); setShowRegModal(true); }, []);

  const spin = useCallback(async () => {
    if (isSpinning) return;
    const hasSpun = localStorage.getItem('wheel_has_spun');
    if (hasSpun) {
      alert('Você já girou a roleta hoje! Volte amanhã.');
      return;
    }

    if (!regData.name || !regData.whatsapp) {
      setShowRegModal(true);
      return;
    }

    setIsSpinning(true);
    const prizeIndex = weightedRandom();
    const prize = PRIZES[prizeIndex];
    const coupon = generateCoupon();

    // Calculate rotation: multiple full spins + landing on the prize segment
    const targetAngle = prizeIndex * SEGMENT_ANGLE;
    const spinAngle = 1800 + (360 - targetAngle - SEGMENT_ANGLE / 2); // 5 full spins
    rotationRef.current += spinAngle;

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.transform = `rotate(${rotationRef.current}deg)`;
      canvas.classList.add('spinning');
    }

    // Wait for animation
    await new Promise((r) => setTimeout(r, 4500));

    if (canvas) canvas.classList.remove('spinning');
    setIsSpinning(false);
    setSpinCount((c) => c + 1);

    // Save spin to localStorage
    localStorage.setItem('wheel_has_spun', 'true');

    // Send to API
    try {
      await fetch(`${API_BASE}/api/public/wheel/spin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: regData.name,
          client_whatsapp: regData.whatsapp,
          prize_name: prize.name,
          prize_type: prize.type,
          prize_value: prize.value,
          coupon_code: coupon,
        }),
      });
    } catch (err) {
      console.error('Erro ao registrar giro:', err);
    }

    setCurrentPrize({ ...prize, coupon });
    setShowRegModal(false);
    setShowResultModal(true);
    setRegData({ name: '', whatsapp: '' });
  }, [isSpinning, regData]);

  return {
    canvasRef,
    isSpinning,
    currentPrize,
    spinCount,
    showRegModal,
    showResultModal,
    showPopup,
    regData,
    setRegData,
    openRegModal,
    closeRegModal,
    closeResultModal,
    closePopup,
    openWheelFromPopup,
    spin,
  };
}
