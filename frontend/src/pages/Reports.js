import React, { useState, useEffect } from 'react';

function Reports() {
  const [resumo, setResumo] = useState(null);
  const [pedidosPendentes, setPedidosPendentes] = useState([]);
  const [clientesAtivos, setClientesAtivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = 'https://logap-desafio-dev-junior-murilo-silva.onrender.com';

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resumoRes, pendentesRes, ativosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/resumo-vendas`),
        fetch(`${API_BASE_URL}/pedidos-pendentes`),
        fetch(`${API_BASE_URL}/clientes-mais-ativos`)
      ]);

      if (!resumoRes.ok || !pendentesRes.ok || !ativosRes.ok) {
        throw new Error(`HTTP error! status: ${resumoRes.status}/${pendentesRes.status}/${ativosRes.status}`);
      }

      const resumoData = await resumoRes.json();
      const pendentesData = await pendentesRes.json();
      const ativosData = await ativosRes.json();

      setResumo(resumoData);
      setPedidosPendentes(pendentesData.value || pendentesData);
      setClientesAtivos(ativosData.value || ativosData);

    } catch (e) {
      setError(`Erro ao carregar relatórios: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h2>Relatórios de Vendas</h2>

      {loading && <p>Carregando relatórios...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Relatório 1: Resumo das Vendas */}
      <h3>Resumo das Vendas</h3>
      {resumo && (
        <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', display: 'inline-block', margin: '10px' }}>
          <p><strong>Total de Pedidos Realizados:</strong> {resumo.totalPedidos}</p>
          <p><strong>Valor Total Faturado:</strong> R$ {resumo.valorTotalFaturado.toFixed(2)}</p>
          <p><strong>Quantidade Total de Produtos Vendidos:</strong> {resumo.quantidadeTotalProdutos}</p>
        </div>
      )}

      {/* Relatório 2: Pedidos Pendentes */}
      <h3>Pedidos Pendentes</h3>
      {pedidosPendentes.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>ID Pedido</th>
              <th>Cliente</th>
              <th>Data do Pedido</th>
              <th>Valor Total</th>
            </tr>
          </thead>
          <tbody>
            {pedidosPendentes.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.cliente_nome}</td>
                <td>{new Date(pedido.data_pedido).toLocaleDateString()}</td>
                <td>R$ {pedido.valor_total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum pedido pendente encontrado.</p>
      )}

      {/* Relatório 3: Clientes Mais Ativos */}
      <h3>Clientes Mais Ativos (por número de pedidos)</h3>
      {clientesAtivos.length > 0 ? (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome do Cliente</th>
              <th>Total de Pedidos</th>
            </tr>
          </thead>
          <tbody>
            {clientesAtivos.map((cliente, index) => (
              <tr key={index}> {/* Usar index como key se não tiver ID único */}
                <td>{cliente.nome}</td>
                <td>{cliente.totalPedidosRealizados}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Nenhum cliente ativo encontrado.</p>
      )}
    </div>
  );
}

export default Reports;