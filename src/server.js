const express = require("express")
const server = express()

//pegar o banco de dados
const db = require("./database/db")

server.use(express.static("public"))

//habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({ extended: true }))

//template engine
const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

//-------------------------------------------------------
//pag index
server.get("/", (req, res) => {
    return res.render("index.html")
})

//-------------------------------------------------------
//pag
server.get("/create-point", (req, res) => {
    return res.render("create-point.html")
})

//-------------------------------------------------------
//inserir
server.post("/savepoint", (req, res) => {

    //inserir dados no banco de dados
    const query = `
         INSERT INTO places (
             image,
             name,
             address,
             address2,
             state,
             city,
             items
         ) VALUES ( ?, ?, ?, ?, ?, ?, ? );    
     `

    const values = [
        req.body.image,
        req.body.name,
        req.body.addres,
        req.body.addres2,
        req.body.uf,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err) {
        if (err) {
            console.log(err)
            //return res.send("Erro no cadastro!")
            return res.render("create-point.html", { err: true })
        }
        console.log('Cadastrado com sucesso')
        console.log(this)

        return res.render("create-point.html", { saved: true })
    }

    db.run(query, values, afterInsertData)
})

//-------------------------------------------------------
//Buscar
server.get("/search", (req, res) => {
    const search = req.query.search

    if (search == ""){
        return res.render("search-results.html", { total: 0 })
    }

    //pegar dados do bd
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }

        const total = rows.length

        //mostrar página com dados do bd
        return res.render("search-results.html", { places: rows, total: total })
    })
})

//-------------------------------------------------------
//deletar
server.get("/search/:id", function (req, res) {
    const  id  = req.params.id

    db.run("DELETE FROM places WHERE id =?",[id], function(err) {
        if (err){
             return res.send("Erro no banco de dados!")
         }
         //return res.redirect("/search")
         return res.render("create-point.html", { del: true })
    })

})



server.listen(3000)