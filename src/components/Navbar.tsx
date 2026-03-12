import Logo from './Logo';

export default function Navbar() {
  return (
    <nav className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Logo />
          </div>
          
          {/* Outros itens do navbar poderiam vir aqui */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <span className="text-gray-500 dark:text-zinc-400 text-sm font-medium">
                Sistema Operacional Magalog
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
