import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import VowelAnalyzer from './pages/VowelAnalyzer';
import ClientManagement from './pages/ClientManagement';
import ProductManagement from './pages/ProductManagement';
import OrderManagement from './pages/OrderManagement';
import Reports from './pages/Reports';
import WelcomeMessage from './components/WelcomeMessage'; 
import Footer from './components/Footer'; 

import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        {/* Container para a logo*/}
        <div className="logo-container">
          <img src="/logap_logo.png" alt="LogAp Sistemas" className="app-logo" /> 
        </div>
        
        {/* Cabeçalho Principal*/}
        <header className="App-header">
          <h1>Sistema de Gestão de Vendas - LogAp</h1>
          <nav>
            <ul>
              <li><Link to="/">Início</Link></li>
              <li><Link to="/vowel-analyzer">Analisador de Vogal (Tarefa 1)</Link></li>
              <li><Link to="/clientes">Clientes</Link></li>
              <li><Link to="/produtos">Produtos</Link></li>
              <li><Link to="/pedidos">Pedidos</Link></li>
              <li><Link to="/relatorios">Relatórios</Link></li>
            </ul>
          </nav>
        </header>

        <main>
          {/* As rotas definem qual componente será renderizado para qual URL */}
          <Routes>
            {/* Rota da página inicial com o efeito de digitação */}
            <Route path="/" element={<WelcomeMessage />} /> 

            {/* Rotas para as funcionalidades */}
            <Route path="/vowel-analyzer" element={<VowelAnalyzer />} />
            <Route path="/clientes" element={<ClientManagement />} />
            <Route path="/produtos" element={<ProductManagement />} />
            <Route path="/pedidos" element={<OrderManagement />} />
            <Route path="/relatorios" element={<Reports />} />
          </Routes>
        </main>

        {/* Rodapé da aplicação */}
        <Footer /> 

      </div> {
        
      }
    </Router>
  );
}

export default App;