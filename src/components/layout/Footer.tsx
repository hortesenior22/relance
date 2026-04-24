import logoUrl from "../../assets/logo_relance.jpg";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-white py-10 mt-20">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
        </div>

        {/* Links */}
        <div className="flex gap-6 text-sm text-gray-500">
          <a href="#" className="hover:text-gray-900">
            Inicio
          </a>
          <a href="#" className="hover:text-gray-900">
            Servicios
          </a>
          <a href="#" className="hover:text-gray-900">
            Precios
          </a>
          <a href="#" className="hover:text-gray-900">
            Contacto
          </a>
        </div>

        {/* Social / extra */}
        <div className="text-sm text-gray-400">
          © {new Date().getFullYear()} Relance. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
