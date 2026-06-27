import { motion } from 'framer-motion';

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const baseStyle = "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-primary-blue/50 disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer";
  
  const variants = {
    primary: "bg-primary-blue text-white hover:bg-primary-dark shadow-button",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200",
    outline: "bg-transparent text-slate-700 hover:bg-slate-50 border border-slate-200",
    danger: "bg-danger-red text-white hover:bg-danger-dark shadow-sm",
    success: "bg-success-green text-white hover:bg-success-dark shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs min-h-[36px]",
    md: "px-5 py-3 text-sm min-h-[48px]", // Rule 2: Min touch target 48px
    lg: "px-7 py-4 text-base min-h-[56px]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
