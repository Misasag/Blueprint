import React, { useEffect, useState } from 'react';

interface BoxModelOverlayProps {
  selectedNodeId: string | null;
}

interface BoxMetrics {
  rect: DOMRect;
  mt: number; mr: number; mb: number; ml: number;
  pt: number; pr: number; pb: number; pl: number;
}

const MARGIN_COLOR = 'rgba(246, 178, 107, 0.45)';
const PADDING_COLOR = 'rgba(147, 196, 125, 0.55)';
const CONTENT_BORDER = '1px dashed rgba(109, 158, 235, 0.9)';

/** Chrome DevTools風のボックスモデル可視化オーバーレイ */
export const BoxModelOverlay: React.FC<BoxModelOverlayProps> = ({ selectedNodeId }) => {
  const [metrics, setMetrics] = useState<BoxMetrics | null>(null);

  useEffect(() => {
    if (!selectedNodeId) { setMetrics(null); return; }
    let raf = 0;
    const measure = () => {
      const el = document.querySelector(`[data-node-id="${CSS.escape(selectedNodeId)}"]`) as HTMLElement | null;
      if (!el) { setMetrics(null); raf = requestAnimationFrame(measure); return; }
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      const next: BoxMetrics = {
        rect,
        mt: parseFloat(cs.marginTop) || 0,
        mr: parseFloat(cs.marginRight) || 0,
        mb: parseFloat(cs.marginBottom) || 0,
        ml: parseFloat(cs.marginLeft) || 0,
        pt: parseFloat(cs.paddingTop) || 0,
        pr: parseFloat(cs.paddingRight) || 0,
        pb: parseFloat(cs.paddingBottom) || 0,
        pl: parseFloat(cs.paddingLeft) || 0,
      };
      setMetrics(prev => {
        if (prev &&
            prev.rect.top === next.rect.top && prev.rect.left === next.rect.left &&
            prev.rect.width === next.rect.width && prev.rect.height === next.rect.height &&
            prev.mt === next.mt && prev.mr === next.mr && prev.mb === next.mb && prev.ml === next.ml &&
            prev.pt === next.pt && prev.pr === next.pr && prev.pb === next.pb && prev.pl === next.pl) {
          return prev;
        }
        return next;
      });
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(raf);
  }, [selectedNodeId]);

  if (!metrics) return null;
  const { rect, mt, mr, mb, ml, pt, pr, pb, pl } = metrics;

  const box = (style: React.CSSProperties, key: string) => (
    <div key={key} style={{ position: 'fixed', pointerEvents: 'none', ...style }} />
  );

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5 }}>
      {/* Margin strips (outside) */}
      {mt > 0 && box({ left: rect.left - ml, top: rect.top - mt, width: rect.width + ml + mr, height: mt, background: MARGIN_COLOR }, 'mt')}
      {mb > 0 && box({ left: rect.left - ml, top: rect.bottom, width: rect.width + ml + mr, height: mb, background: MARGIN_COLOR }, 'mb')}
      {ml > 0 && box({ left: rect.left - ml, top: rect.top, width: ml, height: rect.height, background: MARGIN_COLOR }, 'ml')}
      {mr > 0 && box({ left: rect.right, top: rect.top, width: mr, height: rect.height, background: MARGIN_COLOR }, 'mr')}

      {/* Padding strips (inside) */}
      {pt > 0 && box({ left: rect.left, top: rect.top, width: rect.width, height: pt, background: PADDING_COLOR }, 'pt')}
      {pb > 0 && box({ left: rect.left, top: rect.bottom - pb, width: rect.width, height: pb, background: PADDING_COLOR }, 'pb')}
      {pl > 0 && box({ left: rect.left, top: rect.top + pt, width: pl, height: Math.max(0, rect.height - pt - pb), background: PADDING_COLOR }, 'pl')}
      {pr > 0 && box({ left: rect.right - pr, top: rect.top + pt, width: pr, height: Math.max(0, rect.height - pt - pb), background: PADDING_COLOR }, 'pr')}

      {/* Content box outline */}
      {box({
        left: rect.left + pl,
        top: rect.top + pt,
        width: Math.max(0, rect.width - pl - pr),
        height: Math.max(0, rect.height - pt - pb),
        border: CONTENT_BORDER,
        boxSizing: 'border-box',
      }, 'content')}
    </div>
  );
};
