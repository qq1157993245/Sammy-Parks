export class TermService{
    public async checkterms(cookie:string | undefined):Promise<boolean>{
        return new Promise((resolve,reject) =>{
            fetch('http://localhost:5200/api/v0/check-terms',{
                method: 'GET',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookie}`
                }
            }
            )
            .then(response =>{
                if (response.status !== 200){
                    reject("Unexpected Error")
                    return;
                  }
                return response.json()
            })
            .then(data=>{
                resolve(data)
            })
            .catch(()=> reject("Error"))
        })
    }

    public async acceptterms(cookie:string | undefined):Promise<string>{
        return new Promise((resolve,reject) => {
            fetch('http://localhost:5200/api/v0/accept-terms',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookie}`
                }
        }
            )
            .then(response => {
                if (response.status != 200){
                    reject("Unexpected Error")
                    return 
                }
                return response.json()
            })
            .then(data=>{
                resolve(data)
            })
            .catch(() => reject("Error"))
        })
    }
    
     public async declineterms(cookie:string | undefined):Promise<boolean>{
        return new Promise((resolve,reject) =>{
            fetch('http://localhost:5200/api/v0/decline-terms',{
                method: 'POST',
                headers:{
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${cookie}`
                }
            }
            )
            .then(response =>{
                if (response.status !== 200){
                    reject("Unexpected Error")
                    return;
                  }
                return response.json()
            })
            .then(data=>{
                resolve(data)
            })
            .catch(()=> reject("Error"))
        })
    }
}