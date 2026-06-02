// Inline Heroicons (outline). Stroke 1.5–1.75, currentColor.

const SvgBase = ({ children, className = "", style = {}, ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ width: 20, height: 20, ...style }}
    {...rest}
  >
    {children}
  </svg>
);

const IconSearch = (p) => (
  <SvgBase {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </SvgBase>
);
const IconCart = (p) => (
  <SvgBase {...p}>
    <path d="M3 4h2l2.4 12.4a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21 8H6" />
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </SvgBase>
);
const IconClose = (p) => (
  <SvgBase {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </SvgBase>
);
const IconPlus = (p) => (
  <SvgBase {...p}>
    <path d="M12 5v14M5 12h14" />
  </SvgBase>
);
const IconMinus = (p) => (
  <SvgBase {...p}>
    <path d="M5 12h14" />
  </SvgBase>
);
const IconArrowLeft = (p) => (
  <SvgBase {...p}>
    <path d="M14 7l-5 5 5 5" />
  </SvgBase>
);
const IconArrowRight = (p) => (
  <SvgBase {...p}>
    <path d="M10 7l5 5-5 5" />
  </SvgBase>
);
const IconTrash = (p) => (
  <SvgBase {...p}>
    <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
  </SvgBase>
);

Object.assign(window, {
  IconSearch,
  IconCart,
  IconClose,
  IconPlus,
  IconMinus,
  IconArrowLeft,
  IconArrowRight,
  IconTrash,
});
