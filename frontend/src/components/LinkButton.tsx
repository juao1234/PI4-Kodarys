interface LinkButtonProps {
    href: string;
    text: string
    variant?: 'primary' | 'secondary' | 'outline'
}

export function LinkButton({ href, text, variant = 'primary' }: LinkButtonProps) {
    const base = "font-bold py-4 px-8 rounded-lg transition-all duration-300 transform hover:-translate-y-1 text-sm tracking-wider shadow-lg flex items-center justify-center min-w-[200px]";
    
    const variants = {
        primary: "bg-amber-500 text-black hover:bg-amber-400 hover:shadow-amber-500/20 border border-amber-400",
        secondary: "bg-purple-600 text-white hover:bg-purple-500 border border-purple-500",
        outline: "bg-transparent text-white border-2 border-white/20 hover:bg-white/10 hover:border-white"
    };

    return (
        <a href={href} className={`${base} ${variants[variant]}`}>
            {text}
        </a>
    )
}