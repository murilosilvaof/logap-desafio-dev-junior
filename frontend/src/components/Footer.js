import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear(); // Pega o ano atual automaticamente

  return (
    <footer className="app-footer">
      <p>
        &copy; {currentYear} Sistema de Gestão de Vendas LogAp. Desenvolvido por Murilo Silva.
      </p>
    </footer>
  );
}

export default Footer;