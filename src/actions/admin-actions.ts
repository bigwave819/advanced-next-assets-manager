'use server'
import { auth } from "@/lib/auth";
import { assets, category, user } from "./../lib/db/schema";
import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

const categorySchema = z.object({
    name: z
        .string()
        .min(2, "category must be at least 2 characters long")
        .max(50, "category must be max character 50 "),
});

export type categoryFormValues = z.infer<typeof categorySchema>;

export async function addNewCategoryAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        throw new Error("you must be the admin to add the category");
    }

    try {
        const name = formData.get("name") as string;

        const validatedFields = categorySchema.parse({ name });

        const existingCategory = await db
            .select()
            .from(category)
            .where(eq(category.name, validatedFields.name))
            .limit(1);

        if (existingCategory.length > 0) {
            return {
                success: false,
                message: "category already exists! pleasse try with the different Name",
            };
        }

        await db.insert(category).values({
            name: validatedFields.name,
        });

        revalidatePath("/admin/settings");

        return {
            success: true,
            message: "New category Added",
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "failed to add the category",
        };
    }
}

export async function getAllCategoriesAction() {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user || session.user.role !== "admin") {
            throw new Error("you must be the admin to access the category");
        }

        return await db.select().from(category).orderBy(category.name);
    } catch (error) {
        console.log(error);
        return [];
    }
}

export async function getTotalUserAccountAction() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("you must be the admin to access the category")
    }

    try {
        const result = await db.select({ count: sql<number>`count(*)` }).from(user)

        return result[0]?.count || 0
    } catch (error) {
        console.log(error);
        return 0;
    }
}


export async function deleteCategoryAction(categoryId: number) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "admin") {
        throw new Error("you must be the admin to add the category");
    }
    try {
        await db.delete(category).where(eq(category.id, categoryId))

        revalidatePath("/admin/settings")

        return {
            success: true,
            message: "Category deleted successfully"
        }

    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: "failed to delete category"
        }
    }
}

export async function getTotalAssetsAction() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("you must be the admin to access the category")
    }

    try {
        const result = await db.select({ count: sql<number>`count(*)` }).from(assets)

        return result[0]?.count || 0
    } catch (error) {
        console.log(error);
        return 0;
    }
}

export async function approveAssetsAction(assetId: string) {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("you must be the admin to access the category")
    }

    try {
        await db.update(assets).set({ isApproved: 'approved', updatedAt: new Date() }).where(eq(assets.id, assetId))
        revalidatePath("/admin/assets-approval")
        return {
            success: true
        }
    } catch (error) {
        return {
            success: false
        }
    }
}

export async function rejectAssetsAction(assetId: string) {

    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("you must be the admin to access the category")
    }

    try {
        await db.update(assets).set({ isApproved: 'reject', updatedAt: new Date() }).where(eq(assets.id, assetId))
        revalidatePath("/admin/assets-approval");
        return {
            success: true
        }
    } catch (error) {
        return {
            success: false
        }
    }
}

export async function getPendingAssetsAction() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user || session.user.role !== 'admin') {
        throw new Error("you must be the admin to access this data")
    }
    try {
        const pendingAssets = await db.select({
            asset: assets,
            userName: user.name
        })
            .from(assets)
            .leftJoin(user, eq(assets.userId, user.id))
            .where(eq(assets.isApproved, 'pending'))

        return pendingAssets
    } catch (error) {
        return []
    }
}

