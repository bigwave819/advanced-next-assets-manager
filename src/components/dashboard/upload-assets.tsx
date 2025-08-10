'use client'

import { Plus, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { resolve } from "path";
import { UploadAssetsAction } from "@/actions/dashboard-actions";

type Category = {
    id: number;
    name: string;
    createdAt: Date
}

interface UploadDialogueProps {
    categories: Category[]
}

type FormState = {
    title: string;
    description: string;
    categoryId: string;
    file: File | null;
}

type CloudinarySignature = {
    signature: string;
    timestamp: number;
    apiKey: string;
}

function AssetsUpload({ categories }: UploadDialogueProps) {
    const [open, setOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgressIndicator, setuploadProgressIndicator] = useState(0)
    const [formState, setFormState] = useState<FormState>({
        title: "",
        description: "",
        categoryId: "",
        file: null
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormState(prev => ({ ...prev, [name]: value }))
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setFormState(prev => ({ ...prev, file }))
        }
    }


    const handleCategoryChange = (value: string) => {
        setFormState(prev => ({ ...prev, categoryId: value }))
    }

    async function getCloudinarySignature(): Promise<CloudinarySignature> {
        const timestamp = Math.round(new Date().getTime() / 1000)

        const response = await fetch('/api/cloudinary/signature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timestamp })
        })

        if (!response.ok) {
            throw new Error('failed create the signature')
        }
        return response.json()
    }

    const handleAssetsSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setIsUploading(true)
        setuploadProgressIndicator(0)
        try {
            const { signature, timestamp, apiKey } = await getCloudinarySignature()

            const cloudinaryData = new FormData();
            cloudinaryData.append('file', formState.file as File)
            cloudinaryData.append('api_key', apiKey)
            cloudinaryData.append('timestamp', timestamp.toString())
            cloudinaryData.append('signature', signature)
            cloudinaryData.append('folder', 'next-assets-manager')

            const xhr = new XMLHttpRequest()
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}/auto/upload`)

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100)
                    setuploadProgressIndicator(progress)
                }
            }

            const cloudinaryPromise = new Promise<any>((resolve, reject) => {
                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const response = JSON.parse(xhr.responseText)
                        resolve(response)
                    } else {
                        reject(new Error('Upload to cloudinary Failed'))
                    }
                }

                xhr.onerror = () => reject(new Error('failed to upload to the cloudinary'))
            })

            xhr.send(cloudinaryData)

            const cloudinaryResponse = await cloudinaryPromise;
            const formData = new FormData()
            formData.append('title', formState.title)
            formData.append('description', formState.description)
            formData.append('categoryId', formState.categoryId)
            formData.append('fileUrl', cloudinaryResponse.secure_url)
            formData.append('thumbnailUrl', cloudinaryResponse.secure_url)

            const result = await UploadAssetsAction(formData)
            if (result.success) {
                setOpen(false)
                setFormState({
                    title: "",
                    description: "",
                    categoryId: "",
                    file: null
                })
            } else {
                throw new Error('error uploading')
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsUploading(false)
            setuploadProgressIndicator(0)
        }
    }


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-teal-500 hover:bg-teal-600 text-white cursor-pointer">
                    <Plus className="mr-3 w- h-4" />
                    Upload the assets
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Upload new Assets</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAssetsSubmit} className="space-y-7">
                    <div className="space-y-4">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            value={formState.title}
                            onChange={handleInputChange}
                            id="title"
                            name="title"
                            placeholder="Title"
                        />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            value={formState.description}
                            onChange={handleInputChange}
                            id="description"
                            name="description"
                            placeholder="Description"
                        />
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="description">Category</Label>
                        <Select value={formState.categoryId} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder="Select a Category"
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {
                                    categories.map((c) =>
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.name}
                                        </SelectItem>
                                    )
                                }
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-4">
                        <Label htmlFor="file">Upload File</Label>
                        <Input
                            onChange={handleFileChange}
                            type="file"
                            id="file"
                            accept="image/*"
                        />
                    </div>
                    {
                        isUploading && uploadProgressIndicator > 0 && (
                            <div className="mb-5 w-full bg-stone-100 rounded-full h-2">
                                <div className="bg-teal-500 h-2 rounded-full" style={{ width: `${uploadProgressIndicator}%` }} />
                                <p className="text-xs text-slate-500 mt-2 text-right">{uploadProgressIndicator} % upload</p>
                            </div>
                        )
                    }
                    <DialogFooter>
                        <Button type="submit" className="cursor-pointer">
                            <Upload className="mr- h-4 w-4" />
                            Upload Assets
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default AssetsUpload;