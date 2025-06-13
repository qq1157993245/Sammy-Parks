'use server'

import { cookies } from 'next/headers'
import {TermService} from '@/terms/service'

export async function checkterms():Promise<boolean>{
    const cookie = (await cookies()).get('session')?.value
    const terms = new TermService()
    return await terms.checkterms(cookie)
}

export async function accepterms():Promise<string>{
    const cookie = (await cookies()).get('session')?.value
    const terms = new TermService()
    return await terms.acceptterms(cookie)
}

export async function declineterms():Promise<boolean>{
    const cookie = (await cookies()).get('session')?.value
    const terms = new TermService()
    return await terms.declineterms(cookie)
}