import {AuthChecker} from 'type-graphql'
import {AuthCheck} from './checker'
import {Request} from 'express'
// import {SessionUser} from './index'
export const expressAuthChecker: AuthChecker<Request> = async({context}, roles,)=>{
    try {
        const user = await AuthCheck(context);
        context.user = {id: user.id};
        return roles.some(role => user.roles.includes(role));
    }
    catch{
        return false
    }
} 