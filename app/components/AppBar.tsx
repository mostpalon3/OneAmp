import { signIn, signOut, useSession } from "next-auth/react";

export function AppBar(){
    const session = useSession();
    return (
        <div className="flex justify-between">
        <div >
            OneAMP
        </div>
        <div>
            {session.data?.user && <button className="p-2 m-2 bg-blue-500" onClick={() => signOut()}>
                Sign out
            </button>}
            {!session.data?.user && <button className="p-2 m-2 bg-blue-500" onClick={() => signIn()}>
                Sign in
            </button>}
        </div>
        </div>
    )
}