# Sistema de Gestão Financeira por Comércio

Aplicação web simples para controle de receitas, despesas, margem de contribuição e lucro líquido por comércio. Desenvolvida com HTML, CSS e JavaScript puro, utilizando armazenamento local do navegador (`localStorage`).

## 🚀 Funcionalidades

### 1. 📦 Células de Comércios
Cada célula representa um comércio e contém:
- Nome do comércio
- Percentual de custo (%)
- Percentual de comissão (%)

### 2. 💰 Cadastro de Receita/Despesa
Permite inserir transações financeiras com:
- Data (`YYYY-MM-DD`)
- Tipo: Receita ou Despesa
- Descrição
- Valor

### 3. 📊 Relatório Mensal
Ao acessar um comércio e selecionar um mês, exibe:
- Total de receitas
- Valor de custo aplicado (%)
- Valor da comissão aplicada (%)
- **Margem de contribuição** = receita - custo - comissão
- **Despesas totais**
- **Lucro líquido** = margem - despesas

### 4. 📂 Detalhamento e Navegação
- Lista de receitas e despesas do mês
- Navegação entre meses

## 🧠 Estrutura dos Dados (localStorage)
```json
{
  "comercios": [
    {
      "id": "uuid",
      "nome": "Loja XPTO",
      "custo_percentual": 30,
      "comissao_percentual": 10,
      "transacoes": [
        {
          "tipo": "receita" | "despesa",
          "valor": 1200.00,
          "descricao": "Venda março",
          "data": "2025-05-10"
        }
      ]
    }
  ]
}
```

## 🛠 Tecnologias
- HTML
- CSS
- JavaScript
- Armazenamento local (`localStorage`)

## 🧩 Extras (opcional)
- Filtro por ano/mês
- Exportação CSV
- Botão para limpar dados locais

---

## 👨‍💻 Autor
**Rogoberto Ribeiro**

Este projeto é de uso livre e pode ser adaptado conforme a necessidade.
