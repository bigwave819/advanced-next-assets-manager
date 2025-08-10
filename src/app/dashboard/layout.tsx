import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


async function UserDashboardLayout({ children, } : { children: React.ReactNode ;}) {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session) {
        redirect("/")
    }

    if (session && session.user.role === 'admin') {
        redirect('/admin/assets-approval')
    }
    return (
        <main className="flex-1 p-4 lg:p-6">{ children }</main>
     );
}

export default UserDashboardLayout;