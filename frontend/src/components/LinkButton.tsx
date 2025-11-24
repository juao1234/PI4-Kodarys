interface LinkButtonProps {
    href: string;
    text: string
}

export function LinkButton({ href, text }: LinkButtonProps) {
    return (
        <a href={href} className="bg-amber-300 text-black font-bold !py-3 !rounded-3xl transition-all hover:!text-white hover:!bg-amber-400 hover:shadow-lg hover:shadow-amber-500">{text}</a>
    )
}