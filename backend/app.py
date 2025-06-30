import os
import time
from flask import Flask, request, jsonify # type: ignore
from flask_sqlalchemy import SQLAlchemy # type: ignore
from flask_cors import CORS  # type: ignore

# --- Configuração do Flask ---
app = Flask(__name__)
CORS(app) # Habilita CORS para todas as rotas por padrão (permite frontend React acessar)

# Configuração do SQLAlchemy para usar SQLite
# O banco de dados será criado no diretório 'instance'
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'instance', 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Recomendado para não consumir muita memória
db = SQLAlchemy(app)

# Cria a pasta 'instance'
if not os.path.exists(os.path.join(basedir, 'instance')):
    os.makedirs(os.path.join(basedir, 'instance'))

# --- Modelos de Banco de Dados (Para Tarefa 2) ---
class Cliente(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    # lazy='dynamic' permite consultas eficientes, cascade="all, delete-orphan" garante deleção de pedidos ao deletar cliente
    pedidos = db.relationship('Pedido', backref='cliente', lazy='dynamic', cascade="all, delete-orphan") 

class Produto(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    preco = db.Column(db.Float, nullable=False)
    itens_pedido = db.relationship('ItemPedido', backref='produto', lazy='dynamic') # Usar 'dynamic' para queries eficientes

class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    cliente_id = db.Column(db.Integer, db.ForeignKey('cliente.id'), nullable=False)
    data_pedido = db.Column(db.DateTime, default=db.func.current_timestamp())
    status = db.Column(db.String(50), default="Em andamento", nullable=False) # Ex: "Em andamento", "Finalizado", "Cancelado"
    valor_total = db.Column(db.Float, default=0.0, nullable=False)
    # cascate="all, delete-orphan" garante que itens do pedido sejam deletados junto com o pedido
    itens = db.relationship('ItemPedido', backref='pedido', lazy='dynamic', cascade="all, delete-orphan")

class ItemPedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pedido_id = db.Column(db.Integer, db.ForeignKey('pedido.id'), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey('produto.id'), nullable=False)
    quantidade = db.Column(db.Integer, nullable=False)
    preco_unitario = db.Column(db.Float, nullable=False) # Preço do produto no momento do pedido

# --- Função de Inicialização do Banco de Dados com Dados de Exemplo ---
# Esta função será executada UMA VEZ quando o servidor Flask iniciar
def initialize_database():
    with app.app_context(): 
        db.create_all() # Cria todas as tabelas se não existirem
        
        # Adicionar dados de exemplo APENAS se o banco estiver vazio
        if Cliente.query.count() == 0:
            print("Criando dados de exemplo...")
            
            # Clientes
            cliente1 = Cliente(nome="Maria Silva", email="maria@example.com")
            cliente2 = Cliente(nome="João Souza", email="joao@example.com")
            db.session.add_all([cliente1, cliente2])
            db.session.commit() 

            # Produtos
            produto1 = Produto(nome="Notebook Super", preco=4500.00)
            produto2 = Produto(nome="Mouse Gamer", preco=150.00)
            produto3 = Produto(nome="Teclado Mecânico", preco=300.00)
            produto4 = Produto(nome="Webcam Full HD", preco=250.00)
            db.session.add_all([produto1, produto2, produto3, produto4])
            db.session.commit() 

            # Pedido 1 (Em andamento)
            pedido1 = Pedido(cliente_id=cliente1.id, status="Em andamento")
            db.session.add(pedido1)
            db.session.flush() # Para que o ID do pedido seja gerado

            item1_p1 = ItemPedido(pedido_id=pedido1.id, produto_id=produto1.id, quantidade=1, preco_unitario=produto1.preco)
            item2_p1 = ItemPedido(pedido_id=pedido1.id, produto_id=produto2.id, quantidade=2, preco_unitario=produto2.preco)
            db.session.add_all([item1_p1, item2_p1])
            db.session.commit()
            pedido1.valor_total = sum(item.quantidade * item.preco_unitario for item in pedido1.itens)
            db.session.add(pedido1) # Atualiza o pedido com o valor total calculado
            db.session.commit()

            # Pedido 2 (Finalizado)
            pedido2 = Pedido(cliente_id=cliente2.id, status="Finalizado")
            db.session.add(pedido2)
            db.session.flush()

            item1_p2 = ItemPedido(pedido_id=pedido2.id, produto_id=produto3.id, quantidade=1, preco_unitario=produto3.preco)
            db.session.add(item1_p2)
            db.session.commit()
            pedido2.valor_total = sum(item.quantidade * item.preco_unitario for item in pedido2.itens)
            db.session.add(pedido2)
            db.session.commit()

            # Pedido 3 (Em andamento, do Cliente 1)
            pedido3 = Pedido(cliente_id=cliente1.id, status="Em andamento")
            db.session.add(pedido3)
            db.session.flush()

            item1_p3 = ItemPedido(pedido_id=pedido3.id, produto_id=produto4.id, quantidade=3, preco_unitario=produto4.preco)
            db.session.add(item1_p3)
            db.session.commit()
            pedido3.valor_total = sum(item.quantidade * item.preco_unitario for item in pedido3.itens)
            db.session.add(pedido3)
            db.session.commit()
            
            print("Dados de exemplo criados.")

# --- (apenas para verificar se o backend está rodando) ---
@app.route('/')
def hello_world():
    return 'Backend da Aplicação Web LogAp rodando!'

# --- Tarefa 1: API de Análise de String ---
@app.route('/api/analisar-string', methods=['POST'])
def analisar_string():
    data = request.get_json()
    input_string = data.get('string', '')

    start_time = time.perf_counter() # Início da contagem de tempo

    # Definindo vogais e consoantes para a lógica
    # As vogais e consoantes são tratadas em minúsculas para a lógica de comparação
    vogais = "aeiou"
    consoantes = "bcdfghjklmnpqrstvwxyz"

    found_vowel = ""
    # Mapeia caracteres para suas contagens na string original (case-insensitive)
    char_counts_lower = {}
    for char_orig in input_string:
        lower_char = char_orig.lower()
        char_counts_lower[lower_char] = char_counts_lower.get(lower_char, 0) + 1

    # --- Lógica Principal da Tarefa 1 ---
    # Premissa: Não será possível reiniciar o fluxo de leitura da string.
    
    # Variáveis de controle de estado:
    # last_char_was_vowel: True se o caractere ANTERIOR era uma vogal.
    # found_consonant_after_vowel: True se já encontramos uma sequência VOGAL-CONSOANTE.
    
    last_char_was_vowel = False 
    found_consonant_after_vowel = False

    for char_orig in input_string:
        char_lower = char_orig.lower() # Converte para minúscula para a lógica
        
        is_current_vowel = (char_lower in vogais)
        is_current_consonant = (char_lower in consoantes)

        if not (is_current_vowel or is_current_consonant): # Ignora caracteres que não são letras
            # Resetamos o estado se encontramos algo que não é letra,
            # pois a sequência VOGAL-CONSOANTE-VOGAL precisa ser contínua em letras.
            last_char_was_vowel = False 
            found_consonant_after_vowel = False 
            continue 

        if is_current_vowel: # Se o caractere atual é uma vogal
            if found_consonant_after_vowel: # E já estávamos no estado "VOGAL-CONSOANTE"
                # Significa que encontramos a sequência VOGAL-CONSOANTE-VOGAL
                # Agora, verificamos a condição "que não se repete na string inteira"
                if char_counts_lower.get(char_lower, 0) == 1:
                    found_vowel = char_orig # Guarda a vogal na sua capitalização original
                    break # Encontramos a *primeira* que atende aos critérios, podemos parar
            
            last_char_was_vowel = True # O caractere atual é uma vogal, então o próximo pode vir depois de uma vogal
            found_consonant_after_vowel = False # Reinicia a busca por uma nova sequência VOGAL-CONSOANTE
        
        elif is_current_consonant: # Se o caractere atual é uma consoante
            if last_char_was_vowel: # E o caractere ANTERIOR era uma vogal
                found_consonant_after_vowel = True # Marcamos que encontramos "VOGAL-CONSOANTE"
            else: # Se o anterior não era vogal
                found_consonant_after_vowel = False # Reinicia a busca
            
            last_char_was_vowel = False # O caractere atual não é uma vogal
        
    # --- Fim da Lógica da Tarefa 1 ---

    end_time = time.perf_counter() # Fim da contagem de tempo
    total_time_ms = round((end_time - start_time) * 1000, 2) # Converte para milissegundos

    # Prepara a resposta JSON
    return jsonify({
        "string": input_string,
        "vogal": found_vowel if found_vowel else "Nenhuma vogal encontrada com os critérios.",
        "tempoTotal": f"{total_time_ms}ms"
    })

# --- Tarefa 2: APIs de Gestão de Vendas (CRUD e Relatórios) ---

# --- Rotas de Clientes ---
@app.route('/api/clientes', methods=['GET'])
def get_clientes():
    clientes = Cliente.query.all()
    return jsonify([{'id': c.id, 'nome': c.nome, 'email': c.email} for c in clientes])

@app.route('/api/clientes', methods=['POST'])
def add_cliente():
    data = request.get_json() 
    if not data or 'nome' not in data or 'email' not in data:
        return jsonify({"error": "Nome e email são obrigatórios"}), 400
    
    # Verifica se o email já existe
    if Cliente.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email já cadastrado"}), 409 # Conflict

    new_cliente = Cliente(nome=data['nome'], email=data['email'])
    db.session.add(new_cliente)
    db.session.commit()
    return jsonify({'id': new_cliente.id, 'nome': new_cliente.nome, 'email': new_cliente.email}), 201

@app.route('/api/clientes/<int:cliente_id>', methods=['GET'])
def get_cliente(cliente_id):
    cliente = Cliente.query.get_or_404(cliente_id) 
    return jsonify({'id': cliente.id, 'nome': cliente.nome, 'email': cliente.email})

@app.route('/api/clientes/<int:cliente_id>', methods=['PUT'])
def update_cliente(cliente_id):
    cliente = Cliente.query.get_or_404(cliente_id)
    data = request.get_json()
    
    if 'nome' in data:
        cliente.nome = data['nome']
    if 'email' in data:
        # Verifica se o novo email já existe para outro cliente
        if Cliente.query.filter(Cliente.id != cliente_id, Cliente.email == data['email']).first():
            return jsonify({"error": "Email já cadastrado para outro cliente"}), 409
        cliente.email = data['email']
    
    db.session.commit()
    return jsonify({'message': 'Cliente atualizado com sucesso!'})

@app.route('/api/clientes/<int:cliente_id>', methods=['DELETE'])
def delete_cliente(cliente_id):
    cliente = Cliente.query.get_or_404(cliente_id)
    
    # Com cascade="all, delete-orphan" no relacionamento Cliente.pedidos,
    # deletar o Cliente deveria automaticamente deletar os Pedidos e seus Itens.
    # Se ainda houver problemas, a causa pode ser mais complexa (ex: transação, outro relacionamento não mapeado).
    # A verificação abaixo agora é redundante se o cascade estiver 100% ok.
    # No entanto, a lógica de erro de "não pode deletar cliente com pedidos associados" pode ser útil para o usuário.
    # Se o cascade NÃO DELETAR, esta linha será ignorada e o IntegrityError virá.
    
    # if cliente.pedidos.first() is not None: 
    #     return jsonify({"error": "Não é possível deletar cliente com pedidos associados."}), 400
    
    try:
        db.session.delete(cliente) 
        db.session.commit()
        return jsonify({'message': 'Cliente deletado com sucesso!'}), 200 
    except Exception as e:
        db.session.rollback()
        # Captura e retorna o erro, útil para depuração
        if "FOREIGN KEY constraint failed" in str(e):
            return jsonify({'error': 'Não é possível deletar cliente com pedidos associados (restrição de integridade).'}), 400
        return jsonify({'error': f'Erro ao deletar cliente: {str(e)}'}), 500


# --- Rotas de Produtos ---
@app.route('/api/produtos', methods=['GET'])
def get_produtos():
    produtos = Produto.query.all()
    return jsonify([{'id': p.id, 'nome': p.nome, 'preco': p.preco} for p in produtos])

@app.route('/api/produtos', methods=['POST'])
def add_produto():
    data = request.get_json()
    if not data or 'nome' not in data: # 'preco' pode ser None, então não verificamos se 'preco' está em data aqui.
        return jsonify({"error": "Nome e preço são obrigatórios"}), 400
    
    # Pega o preço, que pode vir como None ou uma string vazia do frontend
    preco_raw = data.get('preco') 

    # Validação robusta para preço
    if preco_raw is None or str(preco_raw).strip() == '': # Verifica se é None ou string vazia/só espaços
        return jsonify({"error": "Preço é obrigatório"}), 400
    
    try:
        preco = float(preco_raw)
        if preco < 0:
            return jsonify({"error": "Preço não pode ser negativo"}), 400
    except (ValueError, TypeError): # Agora o TypeError também é capturado se preco_raw for de um tipo inesperado
        return jsonify({"error": "Preço deve ser um número válido"}), 400

    new_produto = Produto(nome=data['nome'], preco=preco)
    db.session.add(new_produto)
    db.session.commit()
    return jsonify({'id': new_produto.id, 'nome': new_produto.nome, 'preco': new_produto.preco}), 201

@app.route('/api/produtos/<int:produto_id>', methods=['GET'])
def get_produto(produto_id):
    produto = Produto.query.get_or_404(produto_id)
    return jsonify({'id': produto.id, 'nome': produto.nome, 'preco': produto.preco})

@app.route('/api/produtos/<int:produto_id>', methods=['PUT'])
def update_produto(produto_id):
    produto = Produto.query.get_or_404(produto_id)
    data = request.get_json()
    
    if 'nome' in data:
        produto.nome = data['nome']
    if 'preco' in data:
        preco_raw = data.get('preco')
        if preco_raw is None or str(preco_raw).strip() == '':
            return jsonify({"error": "Preço não pode ser vazio"}), 400
        
        try:
            preco_val_float = float(preco_raw)
            if preco_val_float < 0:
                return jsonify({"error": "Preço não pode ser negativo"}), 400
            produto.preco = preco_val_float
        except (ValueError, TypeError):
            return jsonify({"error": "Preço deve ser um número válido"}), 400
    
    db.session.commit()
    return jsonify({'message': 'Produto atualizado com sucesso!'})

@app.route('/api/produtos/<int:produto_id>', methods=['DELETE'])
def delete_produto(produto_id):
    produto = Produto.query.get_or_404(produto_id)
    # Verifica se há itens de pedido associados a este produto antes de deletar
    if produto.itens_pedido.first() is not None: # Usa .first() is not None com lazy='dynamic'
        return jsonify({"error": "Não é possível deletar produto com pedidos associados."}), 400
    
    db.session.delete(produto)
    db.session.commit()
    return jsonify({'message': 'Produto deletado com sucesso!'}), 204

# --- Rotas de Pedidos ---
@app.route('/api/pedidos', methods=['GET'])
def get_pedidos():
    pedidos = Pedido.query.all()
    pedidos_data = []
    for p in pedidos:
        cliente = Cliente.query.get(p.cliente_id) # Busca o cliente relacionado
        itens = []
        # .all() é necessário com lazy='dynamic' para iterar sobre a coleção
        for item in p.itens.all(): 
            produto = Produto.query.get(item.produto_id) # Busca o produto de cada item
            itens.append({
                'id': item.id,
                'produto_id': item.produto_id,
                'produto_nome': produto.nome if produto else "Produto Desconhecido",
                'quantidade': item.quantidade,
                'preco_unitario': item.preco_unitario
            })
        pedidos_data.append({
            'id': p.id,
            'cliente_id': p.cliente_id,
            'cliente_nome': cliente.nome if cliente else "Cliente Desconhecido",
            'data_pedido': p.data_pedido.isoformat(), # Formata a data para ISO 8601
            'status': p.status,
            'valor_total': round(p.valor_total, 2), # Arredonda para 2 casas decimais
            'itens': itens
        })
    return jsonify(pedidos_data)

@app.route('/api/pedidos', methods=['POST'])
def add_pedido():
    data = request.get_json()
    cliente_id = data.get('cliente_id')
    status = data.get('status', 'Em andamento')
    itens_data = data.get('itens', []) # Espera uma lista de itens: [{'produto_id': X, 'quantidade': Y}]

    if not cliente_id or not itens_data:
        return jsonify({"error": "ID do cliente e itens do pedido são obrigatórios"}), 400

    cliente = Cliente.query.get(cliente_id)
    if not cliente:
        return jsonify({"error": "Cliente não encontrado"}), 404

    new_pedido = Pedido(cliente_id=cliente_id, status=status)
    db.session.add(new_pedido)
    db.session.flush() # Importante: garante que new_pedido.id esteja disponível para os itens

    total_pedido = 0
    for item_data in itens_data:
        produto_id = item_data.get('produto_id')
        quantidade = item_data.get('quantidade')

        if not produto_id or not quantidade or not isinstance(quantidade, int) or quantidade <= 0:
            db.session.rollback()
            return jsonify({"error": "Cada item do pedido deve ter produto_id e quantidade (inteiro > 0)"}), 400

        produto = Produto.query.get(produto_id)
        if not produto:
            db.session.rollback()
            return jsonify({"error": f"Produto com ID {produto_id} não encontrado"}), 404
        
        item_pedido = ItemPedido(
            pedido_id=new_pedido.id,
            produto_id=produto_id,
            quantidade=quantidade,
            preco_unitario=produto.preco # Pega o preço atual do produto
        )
        db.session.add(item_pedido)
        total_pedido += quantidade * produto.preco

    new_pedido.valor_total = total_pedido # Atualiza o valor total do pedido
    db.session.commit() # Salva tudo no banco
    
    return jsonify({
        'id': new_pedido.id, 
        'cliente_id': new_pedido.cliente_id, 
        'valor_total': round(new_pedido.valor_total, 2), 
        'status': new_pedido.status 
    }), 201

@app.route('/api/pedidos/<int:pedido_id>', methods=['GET'])
def get_pedido(pedido_id):
    pedido = Pedido.query.get_or_404(pedido_id)
    cliente = Cliente.query.get(pedido.cliente_id)
    itens = []
    for item in pedido.itens.all(): # .all() é necessário com lazy='dynamic' para iterar sobre a coleção
        produto = Produto.query.get(item.produto_id)
        itens.append({
            'id': item.id,
            'produto_id': item.produto_id,
            'produto_nome': produto.nome if produto else "Produto Desconhecido",
            'quantidade': item.quantidade,
            'preco_unitario': item.preco_unitario
        })
    return jsonify({
        'id': pedido.id,
        'cliente_id': pedido.cliente_id,
        'cliente_nome': cliente.nome if cliente else "Cliente Desconhecido",
        'data_pedido': pedido.data_pedido.isoformat(),
        'status': pedido.status,
        'valor_total': round(pedido.valor_total, 2),
        'itens': itens
    })

@app.route('/api/pedidos/<int:pedido_id>', methods=['PUT'])
def update_pedido(pedido_id):
    pedido = Pedido.query.get_or_404(pedido_id)
    data = request.get_json()
    
    if 'status' in data:
        pedido.status = data['status']
    if 'cliente_id' in data: # Permitir mudar o cliente do pedido
        cliente = Cliente.query.get(data['cliente_id'])
        if not cliente:
            return jsonify({"error": "Novo cliente não encontrado"}), 404
        pedido.cliente_id = data['cliente_id']

    # --- Lógica de atualização de itens do pedido  ---
    if 'itens' in data:
        # 1. Deletar todos os ItemPedido antigos associados a este pedido
        for item in pedido.itens.all(): # .all() é necessário com lazy='dynamic' para iterar sobre a coleção
            db.session.delete(item)
        db.session.flush() # Persiste as deleções antes de adicionar novos

        total_pedido = 0
        for item_data in data['itens']:
            produto_id = item_data.get('produto_id')
            quantidade = item_data.get('quantidade')

            if not produto_id or not quantidade or not isinstance(quantidade, int) or quantidade <= 0:
                db.session.rollback()
                return jsonify({"error": "Cada item do pedido deve ter produto_id e quantidade (inteiro > 0)"}), 400

            produto = Produto.query.get(produto_id)
            if not produto:
                db.session.rollback()
                return jsonify({"error": f"Produto com ID {produto_id} não encontrado"}), 404
            
            item_pedido = ItemPedido(
                pedido_id=pedido.id,
                produto_id=produto_id,
                quantidade=quantidade,
                preco_unitario=produto.preco # Pega o preço atual do produto
            )
            db.session.add(item_pedido)
            total_pedido += quantidade * produto.preco
        
        pedido.valor_total = total_pedido # Recalcula o valor total
    
    db.session.commit()
    return jsonify({'message': 'Pedido atualizado com sucesso!'})

@app.route('/api/pedidos/<int:pedido_id>', methods=['DELETE'])
def delete_pedido(pedido_id):
    pedido = Pedido.query.get_or_404(pedido_id)
    # Com cascade="all, delete-orphan" no relacionamento Pedido.itens,
    # deletar o pedido automaticamente deletará seus itens associados.
    db.session.delete(pedido) 
    db.session.commit()
    return jsonify({'message': 'Pedido deletado com sucesso!'}), 204

# --- Rotas de Relatórios ---
@app.route('/api/relatorios/resumo-vendas', methods=['GET'])
def resumo_vendas():
    total_pedidos = db.session.query(Pedido.id).count() # Conta o total de pedidos
    # Soma o valor_total de todos os pedidos. scalar() retorna um único valor.
    # Use 'or 0.0' para garantir que seja 0.0 se não houver pedidos (evitar None)
    valor_total_faturado = db.session.query(db.func.sum(Pedido.valor_total)).scalar() or 0.0 
    
    # Soma a quantidade de todos os produtos vendidos (somando a quantidade de cada ItemPedido)
    quantidade_total_produtos = db.session.query(db.func.sum(ItemPedido.quantidade)).scalar() or 0

    return jsonify({
        "totalPedidos": total_pedidos,
        "valorTotalFaturado": round(valor_total_faturado, 2), # Arredonda para 2 casas decimais
        "quantidadeTotalProdutos": quantidade_total_produtos
    })

@app.route('/api/relatorios/pedidos-pendentes', methods=['GET'])
def pedidos_pendentes():
    # Filtra os pedidos com status "Em andamento"
    pedidos = Pedido.query.filter_by(status="Em andamento").all()
    pedidos_data = []
    for p in pedidos:
        cliente = Cliente.query.get(p.cliente_id)
        pedidos_data.append({
            'id': p.id,
            'cliente_nome': cliente.nome if cliente else "Desconhecido",
            'data_pedido': p.data_pedido.isoformat(),
            'status': p.status,
            'valor_total': round(p.valor_total, 2)
        })
    return jsonify(pedidos_data)

@app.route('/api/relatorios/clientes-mais-ativos', methods=['GET'])
def clientes_mais_ativos():
    # Agrupa os pedidos por cliente e conta quantos pedidos cada cliente fez
    # Ordena do cliente com mais pedidos para o com menos
    clientes_ativos = db.session.query(
        Cliente.nome,
        db.func.count(Pedido.id).label('total_pedidos_realizados')
    ).join(Pedido).group_by(Cliente.id, Cliente.nome).order_by(db.desc('total_pedidos_realizados')).all()

    return jsonify([{'nome': c.nome, 'totalPedidosRealizados': c.total_pedidos_realizados} for c in clientes_ativos])

# --- Execução da Aplicação ---
if __name__ == '__main__':
    # Garante que as tabelas e dados de exemplo sejam criados
    # antes do servidor iniciar, no contexto correto da aplicação.
    initialize_database() 
    app.run(debug=True, port=5000)