import { getCategoriesAction, getUserAssetsAction } from "@/actions/dashboard-actions";
import AssetsGrid from "@/components/dashboard/assets-grid";
import AssetsUpload from "@/components/dashboard/upload-assets";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";


async function AssetsPage() {

     const session = await auth.api.getSession({
        headers: await headers()
    })

    if(session === null) return null

    const [categories, assets] = await Promise.all([
        getCategoriesAction(), 
        getUserAssetsAction(session?.user?.id)
    ])
    return ( 
        <div className="container py-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold">My Assets</h1>
                <AssetsUpload categories={categories || []} />
            </div>
            <AssetsGrid assets={assets || []} />
        </div>
     );
}

export default AssetsPage;