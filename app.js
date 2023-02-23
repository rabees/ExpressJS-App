const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require('mongoose');
const customers = require('./customers.json');
const accounts = require('./accounts.json');
const transactions = require('./transactions.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

//Connect to mongodb through mongoose
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

app.post('/user', (req, res) => {
  const { username } = req.body;
  
  const customer = customers.find((c) => c.username === username);
    
  if (!customer) {
    return res.status(404).json({ message: 'Customer not found' });
  }
  
  const customerAccounts = customer.accounts.map((accountId) => {
  const account = accounts.find((a) => a.account_id.toString() === accountId.toString());
  const accountTransactions = transactions.filter((t) => t.account_id.toString() === accountId.toString());

  return {
    account_id: account.account_id,
    limit: account.limit,
    transaction_count: accountTransactions.length,
  };
});
  
  const response = {
    name: customer.name,
    birthdate: customer.birthdate.$date,
    email: customer.email,
    accounts: customerAccounts,
  };
  
  res.status(200).json(response);
});

app.post('/transactions', (req, res) => {
  const accountId = req.body.account_id;
    
  let totalAmountSold = 0;
  let totalAmountBought = 0;
  
  const account = transactions.find(a => a.account_id === accountId);
  
  if (account) {
    account.transactions.forEach(t => {
      if (t.transaction_code === 'sell') {
        totalAmountSold += t.amount;
      } else if (t.transaction_code === 'buy') {
        totalAmountBought += t.amount;
      }
    });
  
    res.json({ 
      "total_amount_sold": totalAmountSold, 
      "total_amount_bought": totalAmountBought 
    });
  } else {
      res.status(404).send('Account not found');
    }
});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});
