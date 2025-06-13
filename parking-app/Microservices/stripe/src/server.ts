
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({
  path: path.resolve(__dirname, '../../../.env')
})

import app from './app'

const PORT = 5850
app.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`)
  console.log(`API Testing UI: http://localhost:${PORT}/api/v0/docs/`)
})