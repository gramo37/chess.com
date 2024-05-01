import jwt from "jsonwebtoken";
import { db } from "../db";

const SECRET_KEY = process.env.SECRET_KEY ?? "SECRET_KEY";

export const extractUser = async (token: string | string[]) => {
    if(typeof token === "string") {
        const _user: any = jwt.verify(token, SECRET_KEY);
        const user = await db.user.findFirst({
            where: {
                id: _user?.id
            },
            select: {
                id: true,
                name: true
            }
        })
        return user;
    }
    return null;
}