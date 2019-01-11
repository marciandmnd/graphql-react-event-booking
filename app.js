const express = require('express');
const app = express();
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose')

const graphQlSchema = require('./graphql/schema');
const graphQlResolvers = require('./graphql/resolvers');
const isAuth = require('./middleware/is-auth');

app.use(express.json());

// cors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,GET,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(isAuth);

app.use('/graphql', graphqlHttp({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: true
}))

const mongoDBURI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-wb7cg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`;
console.log(mongoDBURI)
mongoose.connect(mongoDBURI, { useNewUrlParser: true })
  .then(() => {
    app.listen(8000)
  }).catch(err => {
    console.log(err)
  })
