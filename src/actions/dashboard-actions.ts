
'use server'

import { auth } from '@/lib/auth';
import { db } from '@/lib/db/index'
import { assets, category } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { z } from 'zod'

const assetsSchema = z.object({
    title: z.string(),
    description: z.string().optional(),
    categoryId: z.number().positive('Please select a category'),
    fileUrl: z.string().url('invalid Url'),
    thumbnailUrl: z.string().url('Invalid File Url').optional()
})

export async function getCategoriesAction() {
    try {
        return db.select().from(category)
    } catch (error) {
        console.log(error);
        return []
    }
}

export async function UploadAssetsAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    if (!session?.user) {
        throw new Error('you must be logged in to upload assets')
    }

    try {
        const validatedFields = assetsSchema.parse({
            title: formData.get('title'),
            description: formData.get('description'),
            categoryId: Number(formData.get('categoryId')),
            fileUrl: formData.get('fileUrl'),
            thumbnailUrl: formData.get('thumbnailUrl') || formData.get('fileUrl')
        })

        await db.insert(assets).values({
            title: validatedFields.title,
            description: validatedFields.description,
            fileUrl: validatedFields.fileUrl,
            thumbnailUrl: validatedFields.thumbnailUrl,
            isApproved: 'pending',
            userId: session.user.id,
            categoryId: validatedFields.categoryId
        })

        revalidatePath('/dashboard/assets')
        return {
            success: true
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: 'faild to store the user assets'
        }
    }
}

export async function getUserAssetsAction(userId: string) {
    try {
        return await db
            .select()
            .from(assets)
            .where(eq(assets.userId, userId))
            .orderBy(assets.createdAt)
    } catch (error) {
        return []
    }
}