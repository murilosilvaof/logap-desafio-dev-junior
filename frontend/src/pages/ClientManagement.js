import React, { useState, useEffect } from 'react';

function ClientManagement() {
  const [clientes, setClientes] = useState([]);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState(''); 
  const [editClientId, setEditClientId] = useState(null); 
  const [editClientName, setEditClientName] = useState('');
  const [editClientEmail, setEditClientEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://127.0.0.1:5000/api/clientes'; // URL da API de clientes

  // --- Funções de Comunicação com a API ---

  // Função para carregar clientes (READ)
  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
     
      setClientes(data.value || data); 
    } catch (e) {
      setError(`Erro ao carregar clientes: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para adicionar cliente (CREATE)
  const handleAddCliente = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: newClientName, email: newClientEmail }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      setNewClientName('');
      setNewClientEmail(''); 
      fetchClientes(); 
    } catch (e) {
      setError(`Erro ao adicionar cliente: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para iniciar edição (UI)
  const startEdit = (cliente) => {
    setEditClientId(cliente.id);
    setEditClientName(cliente.nome);
    setEditClientEmail(cliente.email);
  };

  // Função para cancelar edição (UI)
  const cancelEdit = () => {
    setEditClientId(null);
    setEditClientName('');
    setEditClientEmail('');
  };

  // Função para salvar edição (UPDATE)
  const handleUpdateCliente = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${editClientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome: editClientName, email: editClientEmail }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      cancelEdit(); // Sai do modo de edição
      fetchClientes(); // Recarrega a lista
    } catch (e) {
      setError(`Erro ao atualizar cliente: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Função para deletar cliente (DELETE)
  const handleDeleteCliente = async (id) => {
    if (!window.confirm('Tem certeza que deseja deletar este cliente?')) return; // Confirmação antes de deletar
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
      fetchClientes(); // Recarrega a lista
    } catch (e) {
      setError(`Erro ao deletar cliente: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- Efeito para Carregar Clientes ao Montar o Componente ---
  useEffect(() => {
    fetchClientes();
  }, []); // Array vazio para rodar apenas uma vez na montagem do componente

  // --- Renderização do Componente ---
  return (
    <div>
      <h2>Gerenciamento de Clientes</h2>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Exibe mensagens de erro */}

      <h3>Adicionar Novo Cliente</h3>
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={newClientName}
          onChange={(e) => setNewClientName(e.target.value)}
          placeholder="Nome do Cliente"
          required // Campo obrigatório
        />
        <input
          type="email"
          value={newClientEmail}
          onChange={(e) => setNewClientEmail(e.target.value)} 
          placeholder="Email do Cliente"
          required // Campo obrigatório
        />
        <button onClick={handleAddCliente} disabled={loading}>Adicionar Cliente</button>
      </div>

      <h3>Lista de Clientes</h3>
      <table className="data-table"> {/* Usa a classe CSS que definimos em App.css */}
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {clientes.length > 0 ? ( // Verifica se há clientes para renderizar
            clientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.id}</td>
                <td>
                  {editClientId === cliente.id ? ( // Se estiver em modo de edição
                    <input
                      type="text"
                      value={editClientName}
                      onChange={(e) => setEditClientName(e.target.value)}
                    />
                  ) : (
                    cliente.nome // Se não estiver em modo de edição
                  )}
                </td>
                <td>
                  {editClientId === cliente.id ? ( // Se estiver em modo de edição
                    <input
                      type="email"
                      value={editClientEmail}
                      onChange={(e) => setEditClientEmail(e.target.value)}
                    />
                  ) : (
                    cliente.email // Se não estiver em modo de edição
                  )}
                </td>
                <td>
                  {editClientId === cliente.id ? ( // Botões de Salvar/Cancelar na edição
                    <>
                      <button onClick={handleUpdateCliente} disabled={loading}>Salvar</button>
                      <button onClick={cancelEdit} disabled={loading} style={{ backgroundColor: '#6c757d' }}>Cancelar</button>
                    </>
                  ) : ( // Botões de Editar/Excluir no modo de visualização
                    <>
                      <button onClick={() => startEdit(cliente)} disabled={loading}>Editar</button>
                      <button onClick={() => handleDeleteCliente(cliente.id)} disabled={loading} style={{ backgroundColor: '#dc3545' }}>Excluir</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">Nenhum cliente cadastrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ClientManagement;