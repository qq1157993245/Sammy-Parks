
import dotenv from 'dotenv'
dotenv.config()

import app from './app'

app.listen(5861, () => {
  console.log(`Server Running on port 5861`)
  console.log('API Testing UI: http://localhost:5861/api/v0/docs/')
})