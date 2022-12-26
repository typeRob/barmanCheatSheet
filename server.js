const express=require('express')
const fetch=require('node-fetch')
const app=express()
const port=3000

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))

app.post('/getResult', async(req, res)=>{
    let payload=req.body.payload
    const fetchApi=await fetch('https://www.thecocktaildb.com/api/json/v1/1/'+payload)
    const result=await fetchApi.json()
    res.json(result)
})