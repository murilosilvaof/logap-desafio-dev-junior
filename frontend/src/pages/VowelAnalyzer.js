import React, { useState } from 'react';

function VowelAnalyzer() {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null); 
    setResult(null); 
    try {
      // Faz a requisição POST para a sua API Flask
      const response = await fetch('https://logap-desafio-dev-junior-murilo-silva.onrender.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ string: inputText }), // Envia a string como JSON
      });

      if (!response.ok) { 
      
        const errorData = await response.json();
        throw new Error(errorData.vogal || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json(); // Pega o JSON da resposta
      setResult(data); // Atualiza o estado com o resultado
    } catch (e) {
      setError(`Erro ao analisar a string: ${e.message}`); // Exibe a mensagem de erro
    } finally {
      setLoading(false); // Finaliza o estado de carregamento
    }
  };

  return (
    <div>
      <h2>Analisador de Vogal (Tarefa 1)</h2>
      <p>Encontra a primeira vogal da stream que não se repete após a primeira consoante que é antecessora a uma vogal.</p>
      <div>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite a string aqui..."
          style={{ width: '300px', padding: '8px', marginRight: '10px' }}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Analisando...' : 'Analisar'}
        </button>
      </div>

      {}
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

      {}
      {result && (
        <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '15px', borderRadius: '5px', display: 'inline-block' }}>
          <h3>Resultado:</h3>
          <p><strong>String Analisada:</strong> {result.string}</p>
          <p><strong>Vogal Encontrada:</strong> {result.vogal}</p>
          <p><strong>Tempo Total:</strong> {result.tempoTotal}</p>
        </div>
      )}
      <p style={{ marginTop: '20px', fontSize: '0.9em', color: '#555' }}>Exemplo de entrada: <code>aAbBABacafe</code></p>
      <p style={{ fontSize: '0.9em', color: '#555' }}>Saída esperada: <code>e</code></p>
    </div>
  );
}

export default VowelAnalyzer;