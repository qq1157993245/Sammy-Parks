'use server'

import { ProfileService } from "@/profile/service"
import { cookies } from "next/headers";

export async function uploadImage(file: File) : Promise<string | undefined>{
    const cookie = (await cookies()).get('session')?.value
    const result = await new ProfileService().uploadImage(file, cookie);
    return result
}

export async function getImage() : Promise<string | undefined>{
    const cookie = (await cookies()).get('session')?.value
    const result = await new ProfileService().getImage(cookie);
    return result
}