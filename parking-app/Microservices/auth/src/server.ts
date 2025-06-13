import dotenv from 'dotenv'
dotenv.config()

import app from './app'

app.listen(5200, () => {
  console.log(`Running RESTFul Auth Service on port 5200`)
  console.log('API Testing UI: http://localhost:5200/api/v0/docs/')
})
