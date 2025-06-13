import 'server-only'

export class PlateService {
    public async checkPlate (cookie: string, plate: string) {
       const permitResult = await fetch('http://localhost:5050/graphql',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${cookie}`
            },
            body: JSON.stringify({
                query: `query GetPermitByPlate($plate: String!) {
                    getPermitByPlate(plate: $plate){
                        id
                        permitTypeId
                        driverId
                        vehicleId
                        startTime
                        endTime
                        plate
                        zone
                    }
                }`,
                variables: {
                    plate: plate
                }
            }),
        });

        const result = await permitResult.json();
        console.log(result);
        return result;
    }
}
