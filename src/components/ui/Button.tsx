

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'white';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const variantClass = variant === 'secondary' ? 'secondary' : variant === 'white' ? 'white' : '';
  return (
    <button 
      className={`btn-urban ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

