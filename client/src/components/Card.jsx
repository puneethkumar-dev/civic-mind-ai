import { motion } from 'framer-motion';

export default function Card({ 
  children, 
  className = '', 
  hoverEffect = true, 
  onClick, 
  ...props 
}) {
  const isClickable = typeof onClick === 'function';
  const Component = isClickable ? motion.button : motion.div;
  
  const hoverAnimation = hoverEffect ? { y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)" } : {};
  const tapAnimation = isClickable ? { scale: 0.99 } : {};

  return (
    <Component
      whileHover={hoverAnimation}
      whileTap={tapAnimation}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-slate-100/80 p-5 shadow-premium text-left ${isClickable ? 'cursor-pointer select-none' : ''} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
