
import dotenv from 'dotenv'
dotenv.config()

import app from './app'

app.listen(5860, () => {
  console.log(`Server Running on port 5860`)
  console.log('API Testing UI: http://localhost:5860/api/v0/docs/')
})