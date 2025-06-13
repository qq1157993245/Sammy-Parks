import { Request } from "express";

export async function AuthCheck (context: Request) {
    let jwt = context.headers.authorization
    if (!jwt) {
      throw new Error("No JWT provided")
    }
    jwt = jwt.split(" ")[1]
    
    const response = await fetch('http://localhost:5200/api/v0/check', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        }
    });
    if (response.status !== 200) {
        throw new Error('Unauthorized');
    }
    const data = await response.json();
    return data;
}