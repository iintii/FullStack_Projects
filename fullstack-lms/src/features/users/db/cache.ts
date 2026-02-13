import { getIdTag } from "@/src/lib/dataCache"
import { revalidateTag } from "next/cache"


export function getUserGlobalTadg(){
    return "users"
}

export function getUserIdTag(id:string){
    return getIdTag("users", id)
}

export function revalidateUserCache(id:string){
    revalidateTag(getUserGlobalTadg(), {})
    revalidateTag(getUserIdTag(id), {})
}

