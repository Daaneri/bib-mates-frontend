import { Component } from 'react';
import { RefreshCw, MessageCircle } from 'lucide-react';
import { siteConfig } from '../config/site';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Acá es donde en el futuro se puede mandar el error a un servicio de monitoreo (ej. Sentry).
    console.error('Error atrapado por ErrorBoundary:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bib-black text-bib-white flex flex-col items-center justify-center px-6 text-center gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold mb-3 lowercase">
              algo no salió bien
            </h1>
            <p className="text-bib-gray text-sm max-w-sm mx-auto">
              Encontramos un error inesperado. Ya lo estamos revisando — mientras tanto, probá volver al inicio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={this.handleReload}
              className="flex items-center justify-center gap-2 bg-bib-red hover:bg-bib-white text-bib-white hover:text-bib-black font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-all duration-300"
            >
              <RefreshCw size={16} />
              Volver al inicio
            </button>
            <a
              href={`https://wa.me/${siteConfig.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-bib-white/20 text-bib-white hover:bg-bib-white/10 font-medium rounded px-6 py-3 uppercase tracking-widest text-xs transition-all duration-300"
            >
              <MessageCircle size={16} />
              Avisarnos por WhatsApp
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}