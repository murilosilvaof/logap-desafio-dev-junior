import React, { useState, useEffect } from 'react';

function OrderManagement() {
  const [pedidos, setPedidos] = useState([]);
  const [clientes, setClientes] = useState([]); 
  const [produtos, setProdutos] = useState([]); 
  
  // Estado para novo pedido
  const [newOrderClientId, setNewOrderClientId] = useState('');
  const [newOrderStatus, setNewOrderStatus] = useState('Em andamento');
  const [newOrderItems, setNewOrderItems] = useState([{ productId: '', quantity: 1 }]);


  const [editOrderId, setEditOrderId] = useState(null);
  const [editOrderStatus, setEditOrderStatus] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_PEDIDOS_URL = 'https://logap-desafio-dev-junior-murilo-silva.onrender.com/api/pedidos';
  const API_CLIENTES_URL = 'https://logap-desafio-dev-junior-murilo-silva.onrender.com/api/clientes';
  const API_PRODUTOS_URL = 'https://logap-desafio-dev-junior-murilo-silva.onrender.com/api/produtos';

  // --- Funções de Comunicação com a API ---

  // Função para carregar TODOS os dados necessários (pedidos, clientes, produtos)
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Faz todas as requisições em paralelo para otimizar
      const [pedidosRes, clientesRes, produtosRes] = await Promise.all([
        fetch(API_PEDIDOS_URL),
        fetch(API_CLIENTES_URL),
        fetch(API_PRODUTOS_URL)
      ]);

      // Verifica se todas as respostas HTTP foram bem-sucedidas
      if (!pedidosRes.ok || !clientesRes.ok || !produtosRes.ok) {
        throw new Error(`HTTP error! Status: ${pedidosRes.status}/${clientesRes.status}/${produtosRes.status}`);
      }

      // Converte as respostas para JSON
      const pedidosData = await pedidosRes.json();
      const clientesData = await clientesRes.json();
      const produtosData = await produtosRes.json();

      // Atualiza os estados. Lida com a propriedade 'value' do Invoke-RestMethod 
      setPedidos(pedidosData.value || pedidosData);
      setClientes(clientesData.value || clientesData);
      setProdutos(produtosData.value || produtosData);

    } catch (e) {
      setError(`Erro ao carregar dados: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar um novo pedido (CREATE)
  const handleAddPedido = async () => {
    setLoading(true);
    setError(null);

    // Validação básica do formulário antes de enviar
    if (!newOrderClientId || newOrderItems.some(item => !item.productId || item.quantity <= 0)) {
        setError('Por favor, selecione um cliente e adicione pelo menos um item com produto e quantidade.');
        setLoading(false);
        return;
    }

    const orderData = {
      cliente_id: parseInt(newOrderClientId), // Converte para inteiro
      status: newOrderStatus,
      itens: newOrderItems.map(item => ({ // Mapeia os itens do formulário para o formato da API
        produto_id: parseInt(item.productId),
        quantidade: parseInt(item.quantity)
      }))
    };

    try {
      const response = await fetch(API_PEDIDOS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData), 
      });
      if (!response.ok) {
        const errorData = await response.json(); // Tenta ler a mensagem de erro do backend
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      // Limpa o formulário após sucesso
      setNewOrderClientId('');
      setNewOrderStatus('Em andamento');
      setNewOrderItems([{ productId: '', quantity: 1 }]);
      fetchAllData(); 
    } catch (e) {
      setError(`Erro ao adicionar pedido: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para atualizar um pedido 
  const handleUpdatePedido = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_PEDIDOS_URL}/${editOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: editOrderStatus }), 
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      cancelEdit(); 
      fetchAllData(); 
    } catch (e) {
      setError(`Erro ao atualizar pedido: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar um pedido (DELETE)
  const handleDeletePedido = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este pedido? Esta ação é irreversível.')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_PEDIDOS_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      fetchAllData(); // Recarrega todos os dados
    } catch (e) {
      setError(`Erro ao deletar pedido: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Funções de Manipulação de Itens do Pedido (para o formulário de NOVO PEDIDO) ---
  const handleAddItem = () => {
    setNewOrderItems([...newOrderItems, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index) => {
    const items = [...newOrderItems];
    items.splice(index, 1); // Remove o item no índice especificado
    setNewOrderItems(items);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...newOrderItems];
    items[index][field] = value; // Atualiza o campo (productId ou quantity) do item
    setNewOrderItems(items);
  };

  // --- Funções de Edição (UI) ---
  const startEdit = (pedido) => {
    setEditOrderId(pedido.id);
    setEditOrderStatus(pedido.status);
    // Para edição de itens seria mais complexo e exigiria uma API PUT mais robusta no backend
    // setEditOrderItems(pedido.itens);
  };

  const cancelEdit = () => {
    setEditOrderId(null);
    setEditOrderStatus('');
  };


  // --- Efeito para Carregar Dados ao Montar o Componente ---
  useEffect(() => {
    fetchAllData(); // Carrega os dados (pedidos, clientes, produtos) quando o componente é montado
  }, []); // Array vazio para rodar apenas uma vez na montagem

  // --- Renderização do Componente ---
  return (
    <div>
      <h2>Gerenciamento de Pedidos</h2>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Seção Adicionar Pedido */}
      <h3>Adicionar Novo Pedido</h3>
      <div style={{ marginBottom: '20px', border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
        <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>Cliente:</label>
            <select
                value={newOrderClientId}
                onChange={(e) => setNewOrderClientId(e.target.value)}
                required
            >
                <option value="">Selecione um Cliente</option>
                {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                ))}
            </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
            <label style={{ marginRight: '10px' }}>Status:</label>
            <select
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value)}
                required
            >
                <option value="Em andamento">Em andamento</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cancelado">Cancelado</option>
            </select>
        </div>
        
        <h4>Itens do Pedido:</h4>
        {newOrderItems.map((item, index) => (
          <div key={index} style={{ marginBottom: '10px', padding: '8px', border: '1px dashed #ddd', borderRadius: '4px' }}>
            <label style={{ marginRight: '10px' }}>Produto:</label>
            <select
              value={item.productId}
              onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
              required
              style={{ marginRight: '5px' }}
            >
              <option value="">Selecione um Produto</option>
              {produtos.map((produto) => (
                <option key={produto.id} value={produto.id}>{produto.nome} (R$ {produto.preco.toFixed(2)})</option>
              ))}
            </select>
            <label style={{ marginRight: '5px' }}>Quantidade:</label>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
              placeholder="Qtd"
              min="1"
              required
              style={{ width: '60px', marginLeft: '5px' }}
            />
            {newOrderItems.length > 1 && ( // Permite remover se houver mais de 1 item
              <button onClick={() => handleRemoveItem(index)} style={{ backgroundColor: '#dc3545', marginLeft: '10px' }}>Remover Item</button>
            )}
          </div>
        ))}
        <button onClick={handleAddItem} style={{ backgroundColor: '#28a745', marginRight: '10px' }}>Adicionar Outro Item</button>
        <button onClick={handleAddPedido} disabled={loading} style={{ marginTop: '15px' }}>Adicionar Pedido</button>
      </div>

      {/* Seção Lista de Pedidos */}
      <h3>Lista de Pedidos</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Data</th>
            <th>Status</th>
            <th>Total</th>
            <th>Itens</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.length > 0 ? (
            pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>{pedido.cliente_nome}</td>
                <td>{new Date(pedido.data_pedido).toLocaleDateString()}</td>
                <td>
                  {editOrderId === pedido.id ? (
                    <select
                      value={editOrderStatus}
                      onChange={(e) => setEditOrderStatus(e.target.value)}
                    >
                      <option value="Em andamento">Em andamento</option>
                      <option value="Finalizado">Finalizado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  ) : (
                    pedido.status
                  )}
                </td>
                <td>R$ {pedido.valor_total.toFixed(2)}</td>
                <td>
                  <ul>
                    {pedido.itens.map((item, idx) => (
                      <li key={idx}>
                        {item.produto_nome} ({item.quantidade}x) - R$ {item.preco_unitario.toFixed(2)}/un.
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  {editOrderId === pedido.id ? (
                    <>
                      <button onClick={handleUpdatePedido} disabled={loading}>Salvar</button>
                      <button onClick={cancelEdit} disabled={loading} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(pedido)} disabled={loading}>Editar Status</button> {/* Mudei para Editar Status */}
                      <button onClick={() => handleDeletePedido(pedido.id)} disabled={loading} style={{ backgroundColor: '#dc3545' }}>Excluir</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">Nenhum pedido cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderManagement;