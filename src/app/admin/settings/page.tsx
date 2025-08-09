import { getAllCategoriesAction, getTotalUserAccountAction } from "@/actions/admin-actions";
import CategotyManager from "@/components/admin/category-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";


async function SettingsPage() {

    const [ categories, userCount ] = await Promise.all([
        getAllCategoriesAction(),
        getTotalUserAccountAction()
    ])
    return ( 
        <div className="container py-10">
            <h1 className="text-3xl font-bold mb-5">Admin Settings</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-7">
                <Card className="bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg font-medium">
                            <User className="mr-2 h-5 w-5 text-teal-500"/>
                            Total User
                        </CardTitle>
                        <CardDescription>
                            All registere User on the pLatform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-teal-600">
                            {userCount}
                        </p>
                    </CardContent>
                </Card>
                {/** Total assets */}
                <Card className="bg-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center text-lg font-medium">
                            <User className="mr-2 h-5 w-5 text-teal-500"/>
                            Total Assets
                        </CardTitle>
                        <CardDescription>
                            All registere User on the pLatform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-teal-600">
                            1000
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Category Management</CardTitle>
                    <CardContent>
                        <CategotyManager categories={categories}/>
                    </CardContent>
                </CardHeader>
            </Card>
        </div>
     );
}

export default SettingsPage;