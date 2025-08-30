const express = require("express");
const bodyParser = require("body-parser");
const { createClient } = require("redis");

const app = express();
app.use(bodyParser.json());
app.use(express.static("."));

const client = createClient();

client.connect()
  .then(() => console.log("Conectado ao Redis"))
  .catch(err => console.error("Erro:", err));

app.post("/pedido", async (req, res) => {
  try {
    const pedido = req.body;
    const pedidoId = Date.now();

    await client.set(`pedido:${pedidoId}`, JSON.stringify(pedido));

    res.json({ msg: "Pedido salvo com sucesso!", pedidoId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro ao salvar pedido" });
  }
});

app.get("/pedidos", async (req, res) => {
  try {
    const keys = await client.keys("pedido:*");
    const pedidos = [];

    for (let key of keys) {
      const data = await client.get(key);
      pedidos.push({ id: key, ...JSON.parse(data) });
    }

    res.json(pedidos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erro ao buscar pedidos" });
  }
});

app.listen(3000, () => {
  console.log("Servidor rodando em http://localhost:3000");
});
