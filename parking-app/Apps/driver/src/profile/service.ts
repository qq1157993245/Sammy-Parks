
export class ProfileService {
    public async uploadImage (file: File, cookie: string | undefined) : Promise<string | undefined>{
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch('http://localhost:5200/api/v0/upload-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${cookie}`,
            },
            body: formData,
        });

        if (response.status !== 200) {
            return undefined
        }
        const result = await response.json();
        return result;
    }

    public async getImage (cookie: string | undefined) : Promise<string | undefined>{
        const response = await fetch('http://localhost:5200/api/v0/get-image', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookie}`,
            },
        });

        if (response.status !== 200) {
            return undefined
        }
        const result = await response.json();
        return result;
    }
}