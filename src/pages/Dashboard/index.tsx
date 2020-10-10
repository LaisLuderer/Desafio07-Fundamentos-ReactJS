import React, { useState, useEffect } from 'react';

import { FiChevronDown, FiDollarSign } from 'react-icons/fi';
import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  // dados vindo da api
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      // Carregar as transactions do backend
      const response = await api.get('/transactions');
      /*
para evitar um problema de performace onde sempre que atualizar as transactions
sempre vai ter que ficar formatando o valor, gastando processamento desnecessario
    Objetivo -> formatar apenas uma vez que é quando buscade dentro da API
- var transactionsFaormatted
-pra cada transaction que chegar dá um map() -> response.data.transactions.map()
-pegar cada transaction e retornar um objeto
-passando todos dados que ela já tinha -> ...transaction,
-depois pegar os valores fomatados -> formattedValue: formatValue(transaction.value),
OU SEJA, PRA CADA TRANSACTION QUE CHEGAR EU VOU FORMATAR O VALUE DELA E
GUARDANDO NO formattedValue

*/
      // Formatação direta(apenas uma vez) do value transaction
      const transactionsFormatted = response.data.transactions.map(
        (transaction: Transaction) => ({
          ...transaction,
          formattedValue: formatValue(transaction.value),
          // Formatar a data vinda API usando o Date do JS
          formattedDate: new Date(transaction.created_at).toLocaleDateString(
            'pt-br',
          ),
        }),
      );
      // Formatação direta(apenas uma vez) do value balance
      const balanceFormatted = {
        // quando for formatado ele vira uma string
        income: formatValue(response.data.balance.income),
        outcome: formatValue(response.data.balance.outcome),
        total: formatValue(response.data.balance.total),
      };

      setTransactions(transactionsFormatted);
      setBalance(balanceFormatted);
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>
                  Título
                  <FiChevronDown />
                </th>
                <th>
                  Preço
                  <FiChevronDown />
                </th>
                <th>
                  Categoria
                  <FiChevronDown />
                </th>
                <th>
                  Data
                  <FiChevronDown />
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {/* if para quando o type da transaction = outcome colocar um - */}
                    {/* Desafio - colcoar essa condição lá em cima junto com formatvalue */}
                    {transaction.type === 'outcome' && '-'}
                    {transaction.formattedValue}
                  </td>
                  <td>
                    <FiDollarSign />
                    {transaction.category.title}
                  </td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
