import React, { useState, useEffect } from 'react';

function ProductManagement() {
  const [produtos, setProdutos] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [editProductId, setEditProductId] = useState(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://127.0.0.1:5000/api/produtos';

  // --- Funções de Comunicação com a API ---

  const fetchProdutos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProdutos(data.value || data);
    } catch (e) {
      setError(`Erro ao carregar produtos: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduto = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: newProductName, preco: parseFloat(newProductPrice) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      setNewProductName('');
      setNewProductPrice('');
      fetchProdutos();
    } catch (e) {
      setError(`Erro ao adicionar produto: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (produto) => {
    setEditProductId(produto.id);
    setEditProductName(produto.nome);
    setEditProductPrice(produto.preco.toString()); // Converter para string para o input
  };

  const cancelEdit = () => {
    setEditProductId(null);
    setEditProductName('');
    setEditProductPrice('');
  };

  const handleUpdateProduto = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${editProductId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: editProductName, preco: parseFloat(editProductPrice) }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      cancelEdit();
      fetchProdutos();
    } catch (e) {
      setError(`Erro ao atualizar produto: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduto = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este produto?')) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      fetchProdutos();
    } catch (e) {
      setError(`Erro ao deletar produto: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchProdutos();
  }, []);

  
  return (
    <div>
      <h2>Gerenciamento de Produtos</h2>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <h3>Adicionar Novo Produto</h3>
      <div>
        <input
          type="text"
          value={newProductName}
          onChange={(e) => setNewProductName(e.target.value)}
          placeholder="Nome do Produto"
          required
        />
        <input
          type="number"
          value={newProductPrice}
          onChange={(e) => setNewProductPrice(e.target.value)}
          placeholder="Preço"
          step="0.01"
          required
        />
        <button onClick={handleAddProduto} disabled={loading}>Adicionar Produto</button>
      </div>

      <h3>Lista de Produtos</h3>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Preço</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {produtos.map((produto) => (
            <tr key={produto.id}>
              <td>{produto.id}</td>
              <td>
                {editProductId === produto.id ? (
                  <input
                    type="text"
                    value={editProductName}
                    onChange={(e) => setEditProductName(e.target.value)}
                  />
                ) : (
                  produto.nome
                )}
              </td>
              <td>
                {editProductId === produto.id ? (
                  <input
                    type="number"
                    value={editProductPrice}
                    onChange={(e) => setEditProductPrice(e.target.value)}
                    step="0.01"
                  />
                ) : (
                  `R$ ${produto.preco.toFixed(2)}`
                )}
              </td>
              <td>
                {editProductId === produto.id ? (
                  <>
                    <button onClick={handleUpdateProduto} disabled={loading}>Salvar</button>
                    <button onClick={cancelEdit} disabled={loading} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(produto)} disabled={loading}>Editar</button>
                    <button onClick={() => handleDeleteProduto(produto.id)} disabled={loading} style={{ backgroundColor: '#dc3545' }}>Excluir</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductManagement;